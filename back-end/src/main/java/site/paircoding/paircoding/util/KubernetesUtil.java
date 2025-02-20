package site.paircoding.paircoding.util;

import io.fabric8.kubernetes.api.model.Container;
import io.fabric8.kubernetes.api.model.ContainerBuilder;
import io.fabric8.kubernetes.api.model.IntOrString;
import io.fabric8.kubernetes.api.model.PersistentVolume;
import io.fabric8.kubernetes.api.model.PersistentVolumeBuilder;
import io.fabric8.kubernetes.api.model.PersistentVolumeClaim;
import io.fabric8.kubernetes.api.model.PersistentVolumeClaimBuilder;
import io.fabric8.kubernetes.api.model.Pod;
import io.fabric8.kubernetes.api.model.Quantity;
import io.fabric8.kubernetes.api.model.ResourceRequirements;
import io.fabric8.kubernetes.api.model.ResourceRequirementsBuilder;
import io.fabric8.kubernetes.api.model.Service;
import io.fabric8.kubernetes.api.model.ServiceBuilder;
import io.fabric8.kubernetes.api.model.ServiceList;
import io.fabric8.kubernetes.api.model.ServicePort;
import io.fabric8.kubernetes.api.model.apps.Deployment;
import io.fabric8.kubernetes.api.model.apps.DeploymentBuilder;
import io.fabric8.kubernetes.client.KubernetesClient;
import io.fabric8.kubernetes.client.KubernetesClientException;
import io.fabric8.kubernetes.client.dsl.ExecListener;
import io.fabric8.kubernetes.client.dsl.ExecWatch;
import java.io.ByteArrayOutputStream;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.CountDownLatch;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import site.paircoding.paircoding.entity.Performance;
import site.paircoding.paircoding.entity.ProjectImage;
import site.paircoding.paircoding.entity.enums.LabelKey;
import site.paircoding.paircoding.global.exception.WebsocketException;

@Component
@RequiredArgsConstructor
public class KubernetesUtil {

  @Value("${kubernetes.image-registry}")
  private String imageRegistry;

  @Value("${kubernetes.namespace}")
  private String namespace;

  @Value("${kubernetes.env-label}")
  private String ENV_LABEL;

  @Value("${kubernetes.nodeport.min}")
  private int nodePortMin;

  @Value("${kubernetes.nodeport.max}")
  private int nodePortMax;

  private final KubernetesClient kubernetesClient;

  /**
   * 현재 사용 중인 NodePort 목록을 조회
   */
  private Set<Integer> getUsedNodePorts() {
    Set<Integer> usedPorts = new HashSet<>();

    try {
      // 모든 네임스페이스에서 서비스 조회
      ServiceList serviceList = kubernetesClient.services().inAnyNamespace().list();

      for (Service service : serviceList.getItems()) {
        if (service.getSpec() != null && "NodePort".equals(service.getSpec().getType())) {
          for (ServicePort port : service.getSpec().getPorts()) {
            if (port.getNodePort() != null) {
              usedPorts.add(port.getNodePort());
            }
          }
        }
      }
    } catch (KubernetesClientException e) {
      e.printStackTrace();
    }

    return usedPorts;
  }

  /**
   * 사용 가능한 NodePort 반환
   */
  public int getAvailableNodePort() {
    for (int nodePort = nodePortMin; nodePort < nodePortMax; nodePort++) {
      if (!getUsedNodePorts().contains(nodePort)) {
        return nodePort; // 사용되지 않은 포트 반환
      }
    }

    throw new RuntimeException("지정 범위 내 NodePort 전부 사용중");
  }

  public boolean isExists(String deploymentName) {
    return kubernetesClient.apps().deployments()
        .inNamespace(namespace)
        .withName(deploymentName)
        .get() != null;
  }

  public void createPod(int groupId, String deploymentName, ProjectImage projectImage,
      Performance performance, int nodePort) {
    try {
      // PersistentVolume (PV) 생성
      PersistentVolume pv = new PersistentVolumeBuilder()
          .withNewMetadata()
          .withName(deploymentName + "-pv")
          .addToLabels(LabelKey.ENV.getKey(), ENV_LABEL)
          .addToLabels(LabelKey.GROUP_ID.getKey(), String.valueOf(groupId))
          .addToLabels(LabelKey.DEPLOYMENT_NAME.getKey(), deploymentName)
          .endMetadata()
          .withNewSpec()
          .withCapacity(Map.of("storage", new Quantity(performance.getStorage())))
          .withAccessModes("ReadWriteOnce") // 단일 노드에서 읽기/쓰기 가능
          .withPersistentVolumeReclaimPolicy("Delete") // 삭제 시 데이터 유지
          .withStorageClassName(deploymentName) // StorageClass 지정
          .withNewHostPath()
          .withPath("/mnt/data/" + deploymentName) // 노드의 실제 저장 경로
          .withType("DirectoryOrCreate")
          .endHostPath()
          .endSpec()
          .build();

      // PV 생성
      kubernetesClient.persistentVolumes().create(pv);

      // PersistentVolumeClaim (PVC) 생성
      PersistentVolumeClaim pvc = new PersistentVolumeClaimBuilder()
          .withNewMetadata()
          .withName(deploymentName + "-pvc")
          .withNamespace(namespace)
          .addToLabels(LabelKey.ENV.getKey(), ENV_LABEL)
          .addToLabels(LabelKey.GROUP_ID.getKey(), String.valueOf(groupId))
          .addToLabels(LabelKey.DEPLOYMENT_NAME.getKey(), deploymentName)
          .endMetadata()
          .withNewSpec()
          .withAccessModes("ReadWriteOnce") // 단일 노드에서 읽기/쓰기 가능
          .withStorageClassName(deploymentName) // PV와 동일한 StorageClass
          .withNewResources()
          .addToRequests("storage", new Quantity(performance.getStorage())) // PVC 크기 설정
          .endResources()
          .endSpec()
          .build();

      // PVC 생성
      kubernetesClient.persistentVolumeClaims().inNamespace(namespace).create(pvc);

      // 리소스 제한 설정
      ResourceRequirements resources = new ResourceRequirementsBuilder()
          .addToLimits("cpu", new Quantity(performance.getCpu()))
          .addToLimits("memory", new Quantity(performance.getMemory()))
          .build();

      // 컨테이너 정의
      Container container = new ContainerBuilder()
          .withName(deploymentName)
          .withImage(imageRegistry + ":" + projectImage.getTag())
          .withResources(resources)
          .addNewPort()
          .withContainerPort(projectImage.getPort()) // 컨테이너 내부 포트
          .endPort()
          .addNewVolumeMount()
          .withName(deploymentName + "-volume")
          .withMountPath("/data") // 컨테이너 내 마운트 경로
          .endVolumeMount()
          .build();

      // Deployment 정의
      Deployment deployment = new DeploymentBuilder()
          .withNewMetadata()
          .withName(deploymentName)
          .withNamespace(namespace)
          .addToLabels(LabelKey.ENV.getKey(), ENV_LABEL)
          .addToLabels(LabelKey.GROUP_ID.getKey(), String.valueOf(groupId))
          .addToLabels(LabelKey.DEPLOYMENT_NAME.getKey(), deploymentName)
          .endMetadata()
          .withNewSpec()
          .withNewSelector()
          .addToMatchLabels(LabelKey.DEPLOYMENT_NAME.getKey(), deploymentName) // Selector 설정
          .endSelector()
          .withNewTemplate()
          .withNewMetadata()
          .addToLabels(LabelKey.DEPLOYMENT_NAME.getKey(), deploymentName)
          .endMetadata()
          .withNewSpec()
          .withContainers(container)
          .addNewVolume()
          .withName(deploymentName + "-volume")
          .withNewPersistentVolumeClaim()
          .withClaimName(deploymentName + "-pvc") // PVC 연결
          .endPersistentVolumeClaim()
          .endVolume()
          .endSpec()
          .endTemplate()
          .endSpec()
          .build();

      // Deployment 생성
      kubernetesClient.apps().deployments().inNamespace(namespace).create(deployment);

      // NodePort 방식의 서비스 생성
      Service service = new ServiceBuilder()
          .withNewMetadata()
          .withName(deploymentName + "-service")
          .withNamespace(namespace)
          .addToLabels(LabelKey.ENV.getKey(), ENV_LABEL)
          .addToLabels(LabelKey.GROUP_ID.getKey(), String.valueOf(groupId))
          .addToLabels(LabelKey.DEPLOYMENT_NAME.getKey(), deploymentName)
          .endMetadata()
          .withNewSpec()
          .withType("NodePort")
          .addNewPort()
          .withProtocol("TCP")
          .withPort(projectImage.getPort()) // 서비스가 제공하는 포트
          .withTargetPort(new IntOrString(projectImage.getPort())) // 컨테이너 내부 포트
          .withNodePort(nodePort) // NodePort 지정 (30000~32767 범위에서 지정 가능)
          .endPort()
          .addToSelector(LabelKey.DEPLOYMENT_NAME.getKey(), deploymentName) // 파드와 서비스 매칭
          .endSpec()
          .build();

      // 서비스 생성
      kubernetesClient.services().inNamespace(namespace).create(service);

    } catch (KubernetesClientException e) {
      e.printStackTrace();
      throw new RuntimeException("파드 생성 오류");
    }
  }

  public void deletePod(LabelKey labelKey, String labelValue) {
    try {

      kubernetesClient.apps().deployments()
          .inNamespace(namespace)
          .withLabel(labelKey.getKey(), labelValue)
          .delete();

      kubernetesClient.services()
          .inNamespace(namespace)
          .withLabel(labelKey.getKey(), labelValue)
          .delete();

      kubernetesClient.persistentVolumeClaims()
          .inNamespace(namespace)
          .withLabel(labelKey.getKey(), labelValue)
          .delete();

      kubernetesClient.persistentVolumes()
          .withLabel(labelKey.getKey(), labelValue)
          .delete();
    } catch (Exception e) {
      e.printStackTrace();
      throw new RuntimeException(e);
    }
  }

  public String executeCommand(String deploymentName, String command) {
    CountDownLatch latch = new CountDownLatch(1); // 실행 완료를 기다릴 latch
    ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
    ByteArrayOutputStream errorStream = new ByteArrayOutputStream();

    // Deployment에서 Pod 목록 가져오기
    List<Pod> pods = kubernetesClient.pods()
        .inNamespace(namespace)
        .withLabel(LabelKey.DEPLOYMENT_NAME.getKey(), deploymentName)
        .list()
        .getItems();

    if (pods.isEmpty()) {
      throw new RuntimeException("해당 Deployment에서 실행 중인 Pod가 없습니다.");
    }

    String podName = pods.get(0).getMetadata().getName(); // 첫 번째 Pod 선택

    try (ExecWatch watch = kubernetesClient.pods()
        .inNamespace(namespace)
        .withName(podName)
        .writingOutput(outputStream)  // 정상 출력 저장
        .writingError(errorStream)    // 오류 출력 저장
        .usingListener(new ExecListener() {
          @Override
          public void onOpen() {
          }

          @Override
          public void onFailure(Throwable t, Response response) {
            latch.countDown(); // 실패 시 즉시 종료
          }

          @Override
          public void onClose(int code, String reason) {
            latch.countDown(); // 명령어 실행 종료 시 countDown 호출
          }
        })
        .exec("sh", "-c", command)) {

      latch.await(); // 실행 완료될 때까지 대기
      String output = outputStream.toString().trim();
      String error = errorStream.toString().trim();

      if (!error.isEmpty()) {
        if (error.contains("No such file or directory")) {
          throw new WebsocketException("Path does not exist");
        } else if (error.contains("Is a directory")) {
          throw new WebsocketException("Invalid type");
        } else if (error.contains("Permission denied")) {
          throw new WebsocketException("Permission denied for command");
        } else if (error.contains("cannot remove") || error.contains("failed to")) {
          throw new WebsocketException("File operation failed");
        } else {
          throw new KubernetesClientException("Command failed: " + error);
        }
      }

      return output;
    } catch (WebsocketException e) {
      throw e;
    } catch (InterruptedException e) {
      e.printStackTrace();
      Thread.currentThread().interrupt();
      throw new KubernetesClientException("Command execution interrupted:", e);
    } catch (Exception e) {
      e.printStackTrace();
      throw new KubernetesClientException("Unexpected error executing command", e);
    }
  }

  public void scaleDeployment(String deploymentName, int replicas) {
    try {
      Deployment deployment = kubernetesClient.apps().deployments()
          .inNamespace(namespace)
          .withName(deploymentName)
          .get();

      if (deployment == null) {
        throw new RuntimeException("해당 이름의 Deployment를 찾을 수 없습니다: " + deploymentName);
      }

      // Replica 개수 설정
      deployment.getSpec().setReplicas(replicas);

      // Deployment 업데이트
      kubernetesClient.apps().deployments()
          .inNamespace(namespace)
          .withName(deploymentName)
          .replace(deployment);

      System.out.println(
          "Deployment " + deploymentName + "의 replica 수를 " + replicas + "로 변경하였습니다.");
    } catch (KubernetesClientException e) {
      e.printStackTrace();
      throw new RuntimeException("Deployment replica 조정 중 오류 발생");
    }
  }

}
