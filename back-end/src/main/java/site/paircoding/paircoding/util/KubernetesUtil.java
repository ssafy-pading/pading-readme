package site.paircoding.paircoding.util;

import io.fabric8.kubernetes.api.model.Container;
import io.fabric8.kubernetes.api.model.ContainerBuilder;
import io.fabric8.kubernetes.api.model.IntOrString;
import io.fabric8.kubernetes.api.model.Pod;
import io.fabric8.kubernetes.api.model.PodBuilder;
import io.fabric8.kubernetes.api.model.Quantity;
import io.fabric8.kubernetes.api.model.ResourceRequirements;
import io.fabric8.kubernetes.api.model.ResourceRequirementsBuilder;
import io.fabric8.kubernetes.api.model.Service;
import io.fabric8.kubernetes.api.model.ServiceBuilder;
import io.fabric8.kubernetes.api.model.ServiceList;
import io.fabric8.kubernetes.api.model.ServicePort;
import io.fabric8.kubernetes.client.KubernetesClient;
import io.fabric8.kubernetes.client.KubernetesClientException;
import io.fabric8.kubernetes.client.dsl.ExecListener;
import io.fabric8.kubernetes.client.dsl.ExecWatch;
import io.fabric8.kubernetes.client.dsl.PodResource;
import java.io.ByteArrayOutputStream;
import java.util.HashSet;
import java.util.Set;
import java.util.concurrent.CountDownLatch;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import site.paircoding.paircoding.entity.Performance;
import site.paircoding.paircoding.entity.ProjectImage;
import site.paircoding.paircoding.entity.enums.LabelKey;
import site.paircoding.paircoding.global.exception.BadRequestException;

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

  public boolean isExists(String podName) {
    PodResource podResource = kubernetesClient.pods().inNamespace(namespace).withName(podName);
    return podResource.get() != null;
  }

  public void createPod(int groupId, String podName, ProjectImage projectImage,
      Performance performance,
      int nodePort) {
    try {

      // pv, pvc 생성 with label

      // 리소스 제한 설정
      ResourceRequirements resources = new ResourceRequirementsBuilder()
          .addToLimits("cpu", new Quantity(performance.getCpu()))
          .addToLimits("memory", new Quantity(performance.getMemory()))
          .addToLimits("ephemeral-storage", new Quantity(performance.getStorage()))
          .build();

      // 컨테이너 정의
      Container container = new ContainerBuilder()
          .withName(podName)
          .withImage(imageRegistry + ":" + projectImage.getTag())
          .withResources(resources)
          .addNewPort()
          .withContainerPort(projectImage.getPort()) // 컨테이너 내부 포트
          .endPort()
          .build();

      // 파드 정의
      Pod pod = new PodBuilder()
          .withNewMetadata()
          .withName(podName)
          .withNamespace(namespace)
          .addToLabels(LabelKey.ENV.getKey(), ENV_LABEL)
          .addToLabels(LabelKey.GROUP_ID.getKey(), String.valueOf(groupId))
          .addToLabels(LabelKey.POD_NAME.getKey(), podName)
          .endMetadata()
          .withNewSpec()
          .withContainers(container)
          .endSpec()
          .build();

      // 파드 생성
      kubernetesClient.pods().inNamespace(namespace).create(pod);

      // NodePort 방식의 서비스 생성
      Service service = new ServiceBuilder()
          .withNewMetadata()
          .withName(podName + "-service")
          .withNamespace(namespace)
          .addToLabels(LabelKey.ENV.getKey(), ENV_LABEL)
          .addToLabels(LabelKey.GROUP_ID.getKey(), String.valueOf(groupId))
          .addToLabels(LabelKey.POD_NAME.getKey(), podName)
          .endMetadata()
          .withNewSpec()
          .withType("NodePort")
          .addNewPort()
          .withProtocol("TCP")
          .withPort(projectImage.getPort()) // 서비스가 제공하는 포트
          .withTargetPort(new IntOrString(projectImage.getPort())) // 컨테이너 내부 포트
          .withNodePort(nodePort) // NodePort 지정 (30000~32767 범위에서 지정 가능)
          .endPort()
          .addToSelector(LabelKey.POD_NAME.getKey(), podName) // 파드와 서비스 매칭
          .endSpec()
          .build();

      // 서비스 생성
      kubernetesClient.services().inNamespace(namespace).create(service);

    } catch (KubernetesClientException e) {
      e.printStackTrace();
      throw new BadRequestException("잠시 후 다시 요청해주세요.");
    }
  }

  public void deletePod(LabelKey labelKey, String labelValue) {
    try {

      kubernetesClient.pods()
          .inNamespace(namespace)
          .withLabel(labelKey.getKey(), labelValue)
          .delete();

      kubernetesClient.services()
          .inNamespace(namespace)
          .withLabel(labelKey.getKey(), labelValue)
          .delete();
    } catch (Exception e) {
      e.printStackTrace();
      throw new RuntimeException(e);
    }
  }

  public String executeCommand(String podName, String command) {
    CountDownLatch latch = new CountDownLatch(1); // 실행 완료를 기다릴 latch
    ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
    ByteArrayOutputStream errorStream = new ByteArrayOutputStream();

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
        throw new KubernetesClientException("Command failed: " + error);
      }

      return output;
    } catch (Exception e) {
      Thread.currentThread().interrupt();
      throw new KubernetesClientException("Error executing command: " + command, e);
    }
  }
}
