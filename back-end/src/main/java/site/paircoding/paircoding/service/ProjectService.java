package site.paircoding.paircoding.service;

import jakarta.transaction.Transactional;
import java.util.List;
import java.util.Set;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import site.paircoding.paircoding.entity.Group;
import site.paircoding.paircoding.entity.GroupUser;
import site.paircoding.paircoding.entity.Performance;
import site.paircoding.paircoding.entity.Project;
import site.paircoding.paircoding.entity.ProjectImage;
import site.paircoding.paircoding.entity.ProjectUser;
import site.paircoding.paircoding.entity.ProjectUserId;
import site.paircoding.paircoding.entity.User;
import site.paircoding.paircoding.entity.dto.GroupUserResponse;
import site.paircoding.paircoding.entity.dto.ProjectCreateRequest;
import site.paircoding.paircoding.entity.dto.ProjectLanguageDto;
import site.paircoding.paircoding.entity.dto.ProjectOSDto;
import site.paircoding.paircoding.entity.dto.ProjectPerformanceDto;
import site.paircoding.paircoding.entity.enums.Role;
import site.paircoding.paircoding.global.exception.BadRequestException;
import site.paircoding.paircoding.repository.GroupRepository;
import site.paircoding.paircoding.repository.GroupUserRepository;
import site.paircoding.paircoding.repository.PerformanceRepository;
import site.paircoding.paircoding.repository.ProjectImageRepository;
import site.paircoding.paircoding.repository.ProjectRepository;
import site.paircoding.paircoding.repository.ProjectUserRepository;
import site.paircoding.paircoding.repository.UserRepository;
import site.paircoding.paircoding.util.KubernetesUtil;
import site.paircoding.paircoding.util.RandomUtil;

@Service
@RequiredArgsConstructor
public class ProjectService {

  private final UserRepository userRepository;
  private final GroupRepository groupRepository;
  private final ProjectImageRepository projectImageRepository;
  private final PerformanceRepository performanceRepository;
  private final KubernetesUtil kubernetesUtil;
  private final ProjectRepository projectRepository;
  private final GroupUserRepository groupUserRepository;
  private final ProjectUserRepository projectUserRepository;

  public List<ProjectLanguageDto> getLanguage() {
    return projectImageRepository.findDistinctLanguage();
  }

  public List<ProjectOSDto> getOS(String language) {
    return projectImageRepository.findOsByLanguage(language);
  }

  public List<ProjectPerformanceDto> getPerformance() {
    return performanceRepository.findAllPerformance();
  }

  public List<GroupUserResponse> getMemberUsers(Integer groupId) {
    List<GroupUser> groupMemberUsers = groupUserRepository.findGroupUserByGroupIdAndRole(groupId,
        Role.MEMBER);
    return groupMemberUsers.stream().map(groupUser ->
            GroupUserResponse.builder()
                .id(groupUser.getUser().getId())
                .name(groupUser.getUser().getName())
                .image(groupUser.getUser().getImage())
                .email(groupUser.getUser().getEmail())
                .role(groupUser.getRole())
                .build())
        .toList();
  }

  @Transactional
  public Project createProject(Integer groupId, ProjectCreateRequest request) {
    // 그룹 확인
    Group group = groupRepository.findById(groupId).orElseThrow();

    // 유저 확인
    List<User> users = userRepository.findAllById(request.getUserIds());

    // 멤버 권한인 그룹 유저 리스트 확인
    Set<Integer> groupMemberUsers = groupUserRepository.findUserIdsByGroupIdAndRole(groupId,
        Role.MEMBER);

    // 추가하려는 유저 유효성 검사
    if (request.getUserIds().stream()
        .anyMatch(userId -> !groupMemberUsers.contains(userId))) {
      throw new BadRequestException("유저");
    }

    // 언어와 os에 해당하는 이미지 확인
    ProjectImage projectImage = projectImageRepository.findByLanguageAndOs(request.getLanguage(),
        request.getOs()).orElseThrow(() -> new BadRequestException("Project image not found"));

    // 사양 확인
    Performance performance = performanceRepository.findById(request.getPerformanceId())
        .orElseThrow();

    // 고유한 파드명 생성
    String podName;
    do {
      podName = request.getName() + "-" + RandomUtil.generateRandomString();
    } while (kubernetesUtil.isExists(podName));

    // 프로젝트 생성
    Project project = Project.builder()
        .group(group)
        .projectImage(projectImage)
        .performance(performance)
        .name(request.getName())
        .containerId(podName)
        .build();
    projectRepository.save(project);

    // 유효한 유저들을 필터링 (해당 유저가 그룹에 속한 유저인지 확인)
    List<ProjectUser> projectUsers = users.stream()
        .map(user -> ProjectUser.builder()
            .projectUserId(new ProjectUserId(user.getId(), project.getId()))
            .user(user)
            .project(project)
            .build())
        .toList();
    projectUserRepository.saveAll(projectUsers);

    // 프로젝트 생성 확인 후 파드 생성 요청
    kubernetesUtil.createPod(podName, projectImage, performance);

    return project;
  }


}
