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
import io.fabric8.kubernetes.client.dsl.PodResource;
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
}
