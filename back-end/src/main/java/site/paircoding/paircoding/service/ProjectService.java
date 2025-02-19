package site.paircoding.paircoding.service;

import java.util.List;
import java.util.Set;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import site.paircoding.paircoding.config.AppConfig;
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
import site.paircoding.paircoding.entity.dto.ProjectUserDto;
import site.paircoding.paircoding.entity.dto.ProjectWithUsersResponse;
import site.paircoding.paircoding.entity.enums.LabelKey;
import site.paircoding.paircoding.entity.enums.Role;
import site.paircoding.paircoding.global.exception.BadRequestException;
import site.paircoding.paircoding.global.exception.NotFoundException;
import site.paircoding.paircoding.repository.GroupRepository;
import site.paircoding.paircoding.repository.GroupUserRepository;
import site.paircoding.paircoding.repository.PerformanceRepository;
import site.paircoding.paircoding.repository.ProjectImageRepository;
import site.paircoding.paircoding.repository.ProjectRepository;
import site.paircoding.paircoding.repository.ProjectUserRepository;
import site.paircoding.paircoding.repository.UserRepository;
import site.paircoding.paircoding.util.KubernetesUtil;
import site.paircoding.paircoding.util.NginxConfigUtil;
import site.paircoding.paircoding.util.RandomUtil;
import site.paircoding.paircoding.util.RedisUtil;

@Service
@RequiredArgsConstructor
public class ProjectService {

  private final AppConfig appConfig;
  private final UserRepository userRepository;
  private final GroupRepository groupRepository;
  private final ProjectImageRepository projectImageRepository;
  private final PerformanceRepository performanceRepository;
  private final KubernetesUtil kubernetesUtil;
  private final NginxConfigUtil nginxConfigUtil;
  private final ProjectRepository projectRepository;
  private final GroupUserRepository groupUserRepository;
  private final ProjectUserRepository projectUserRepository;
  private final RedisUtil redisUtil;
  private static final String CALL_STATUS_KEY = "callStatusProjectId:%s"; // Redis 저장 키 형식
  private static final String PROJECT_USER_KEY = "project:%s:user:%s"; // Redis 저장 키 형식

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
    Group group = groupRepository.findById(groupId)
        .orElseThrow(() -> new NotFoundException("Group not found"));

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
        .orElseThrow(() -> new BadRequestException("Performance not found"));

    // 고유한 파드명 생성
    String deploymentName;
    do {
      deploymentName = request.getName() + "-" + RandomUtil.generateRandomString();
    } while (kubernetesUtil.isExists(deploymentName));

    // 프로젝트 생성
    Project project = Project.builder()
        .group(group)
        .projectImage(projectImage)
        .runCommand(projectImage.getDefaultRunCommand())
        .performance(performance)
        .name(request.getName())
        .containerId(deploymentName)
        .build();

    // 유효한 유저들을 필터링 (해당 유저가 그룹에 속한 유저인지 확인)
    List<ProjectUser> projectUsers = users.stream()
        .map(user -> ProjectUser.builder()
            .projectUserId(new ProjectUserId(user.getId(), project.getId()))
            .user(user)
            .project(project)
            .build())
        .toList();

    // 서브도메인 생성
    String subdomain = nginxConfigUtil.createSubdomain(project.getContainerId());
    project.setDeploymentUrl(subdomain + "." + appConfig.getDomain());

    // DeploymentUrl 지정 이후 저장
    projectRepository.save(project);
    projectUserRepository.saveAll(projectUsers);

    // 사용 가능한 nodePort 조회
    project.setNodePort(kubernetesUtil.getAvailableNodePort());

    // 프로젝트 생성 확인 후 파드 생성 요청
    kubernetesUtil.createPod(group.getId(), deploymentName, projectImage, performance,
        project.getNodePort());

    // 서브도메인 설정 - nginx config 파일 생성 및 reload
    nginxConfigUtil.createNginxConfig(subdomain, project.getNodePort());

    redisUtil.set(CALL_STATUS_KEY.formatted(project.getId()), "inactive");

    return project;
  }

  public Project getProject(Integer groupId, Integer projectId) {
    return projectRepository.findByGroupIdAndProjectId(groupId, projectId)
        .orElseThrow(() -> new BadRequestException("Project not found"));
  }

  public List<ProjectWithUsersResponse> getProjects(User user, Integer groupId) {
    GroupUser groupUser = groupUserRepository.findByGroupIdAndUserId(groupId, user.getId())
        .orElseThrow(() -> new BadRequestException("Group user not found"));

    List<Project> projects;
    if (groupUser.getRole() == Role.MEMBER) {
      List<ProjectUser> projectUsers = projectUserRepository.findByUser(user);
      projects = projectUsers.stream()
          .map(ProjectUser::getProject)
          .toList();
    } else {
      projects = projectRepository.findByGroupId(groupId);
    }

    return projects.stream()
        .map(project -> {
          List<ProjectUser> projectUsers = projectUserRepository.findByProject(project);
          List<ProjectUserDto> userDtos = projectUsers.stream()
              .map(projectUser -> {
                String userId = String.valueOf(projectUser.getUser().getId());
                String projectId = String.valueOf(project.getId()); // 현재 프로젝트 ID 가져오기
                String redisKey = PROJECT_USER_KEY.formatted(projectId, userId);

                boolean status = redisUtil.hasKey(redisKey); // ✅ Redis에서 접속 여부 확인

                return ProjectUserDto.builder()
                    .id(projectUser.getUser().getId())
                    .name(projectUser.getUser().getName())
                    .image(projectUser.getUser().getImage())
                    .email(projectUser.getUser().getEmail())
                    .status(status) // ✅ Redis 상태 반영
                    .build();
              })
              .toList();

          // ✅ Redis에서 CALL_STATUS_KEY 값 조회
          String callStatusKey = CALL_STATUS_KEY.formatted(project.getId());
          String callStatus = (String) redisUtil.get(callStatusKey);

          // ✅ 값이 null이면 "inactive"으로 설정
          if (callStatus == null) {
            redisUtil.set(callStatusKey, "inactive");
            callStatus = "inactive";
          }

          return ProjectWithUsersResponse.builder()
              .project(project)
              .users(userDtos)
              .callStatus(callStatus) // ✅ Redis 상태 반영
              .build();
        })
        .toList();
  }


  public ProjectWithUsersResponse getDetailProject(User user, Integer groupId, Integer projectId) {
    Project project = projectRepository.findByGroupIdAndProjectId(groupId, projectId)
        .orElseThrow(() -> new BadRequestException("Project not found"));
    GroupUser groupUser = groupUserRepository.findByGroupIdAndUserId(groupId, user.getId())
        .orElseThrow(() -> new BadRequestException("Group user not found"));
    if (groupUser.getRole() == Role.MEMBER) {
      projectUserRepository.findProjectUserByProjectIdAndUser(projectId, user)
          .orElseThrow(() -> new BadRequestException("Project user not found"));
    }
    List<ProjectUser> projectUsers = projectUserRepository.findByProject(project);
    List<ProjectUserDto> userDtos = projectUsers.stream()
        .map(projectUser -> {
          String userId = String.valueOf(projectUser.getUser().getId());
          String redisKey = PROJECT_USER_KEY.formatted(projectId, userId);

          boolean status = redisUtil.hasKey(redisKey); // ✅ Redis에서 접속 여부 확인

          return ProjectUserDto.builder()
              .id(projectUser.getUser().getId())
              .name(projectUser.getUser().getName())
              .image(projectUser.getUser().getImage())
              .email(projectUser.getUser().getEmail())
              .status(status) // ✅ Redis 상태 반영
              .build();
        })
        .toList();
    // ✅ Redis에서 CALL_STATUS_KEY 값 조회
    String callStatusKey = CALL_STATUS_KEY.formatted(projectId);
    String callStatus = (String) redisUtil.get(callStatusKey);

    // ✅ 값이 null이면 "inactive"으로 설정
    if (callStatus == null) {
      redisUtil.set(callStatusKey, "inactive");
      callStatus = "inactive";
    }

    return ProjectWithUsersResponse.builder()
        .project(project)
        .users(userDtos)
        .callStatus(callStatus) // ✅ Redis 상태 반영
        .build();
  }

  @Transactional
  public void deleteProject(Integer groupId, Integer projectId) {
    Project project = projectRepository.findByGroupIdAndProjectId(groupId, projectId)
        .orElseThrow(() -> new BadRequestException("Project not found"));

    // 프로젝트 유저 삭제
    projectUserRepository.deleteByProject(project);

    // 프로젝트 삭제
    projectRepository.delete(project);

    // pod 삭제
    kubernetesUtil.deletePod(LabelKey.DEPLOYMENT_NAME, project.getContainerId());

    // nginx config 삭제
    nginxConfigUtil.deleteNginxConfig(project.getContainerId());

    redisUtil.delete(CALL_STATUS_KEY.formatted(projectId));
  }

  public List<GroupUserResponse> getProjectUserIds(Integer groupId, Integer projectId) {
    projectRepository.findByGroupIdAndProjectId(groupId, projectId)
        .orElseThrow(() -> new NotFoundException("Project not found"));

    String pattern = "project:" + projectId + ":user:*";
    Set<String> keys = redisUtil.keys(pattern);
    List<GroupUserResponse> groupUserResponses = keys.stream()
        .map(key -> {
          String[] split = key.split(":");
          Integer userId = Integer.parseInt(split[3]);
          GroupUser groupUser = groupUserRepository.findByGroupIdAndUserId(groupId, userId)
              .orElseThrow(() -> new NotFoundException("Group user not found"));
          User user = groupUser.getUser();
          return GroupUserResponse.builder()
              .id(user.getId())
              .name(user.getName())
              .image(user.getImage())
              .email(user.getEmail())
              .role(groupUser.getRole())
              .build();
        })
        .toList();
    return groupUserResponses;
  }
}
