package site.paircoding.paircoding.util;

import io.fabric8.kubernetes.api.model.Container;
import io.fabric8.kubernetes.api.model.ContainerBuilder;
import io.fabric8.kubernetes.api.model.Pod;
import io.fabric8.kubernetes.api.model.PodBuilder;
import io.fabric8.kubernetes.api.model.Quantity;
import io.fabric8.kubernetes.api.model.ResourceRequirements;
import io.fabric8.kubernetes.api.model.ResourceRequirementsBuilder;
import io.fabric8.kubernetes.client.KubernetesClient;
import io.fabric8.kubernetes.client.KubernetesClientException;
import io.fabric8.kubernetes.client.dsl.ExecListener;
import io.fabric8.kubernetes.client.dsl.ExecWatch;
import io.fabric8.kubernetes.client.dsl.PodResource;
import java.io.ByteArrayOutputStream;
import java.util.concurrent.CountDownLatch;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import site.paircoding.paircoding.entity.Performance;
import site.paircoding.paircoding.entity.ProjectImage;
import site.paircoding.paircoding.global.exception.BadRequestException;

@Component
@RequiredArgsConstructor
public class KubernetesUtil {

  @Value("${kubernetes.image-registry}")
  private String imageRegistry;

  @Value("${kubernetes.namespace}")
  private String namespace;

  private final KubernetesClient kubernetesClient;

  public boolean isExists(String podName) {
    PodResource podResource = kubernetesClient.pods().inNamespace(namespace).withName(podName);
    return podResource.get() != null;
  }

  public void createPod(String podName, ProjectImage projectImage, Performance performance) {
    try {

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
          .build();

      // 파드 정의
      Pod pod = new PodBuilder()
          .withNewMetadata()
          .withName(podName)
          .withNamespace(namespace)
          .endMetadata()
          .withNewSpec()
          .withContainers(container)
          .endSpec()
          .build();

      // 파드 생성
      kubernetesClient.pods().inNamespace(namespace).create(pod);
    } catch (KubernetesClientException e) {
      e.printStackTrace();
      throw new BadRequestException("잠시 후 다시 요청해주세요.");
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
