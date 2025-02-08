package site.paircoding.paircoding.controller;

import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import site.paircoding.paircoding.config.oauth.CustomUserDetails;
import site.paircoding.paircoding.entity.Project;
import site.paircoding.paircoding.entity.User;
import site.paircoding.paircoding.entity.dto.GroupUserResponse;
import site.paircoding.paircoding.entity.dto.ProjectCreateRequest;
import site.paircoding.paircoding.entity.dto.ProjectLanguageDto;
import site.paircoding.paircoding.entity.dto.ProjectOSDto;
import site.paircoding.paircoding.entity.dto.ProjectPerformanceDto;
import site.paircoding.paircoding.global.ApiResponse;
import site.paircoding.paircoding.service.GroupService;
import site.paircoding.paircoding.service.ProjectService;

@RestController
@RequiredArgsConstructor
@RequestMapping("/v1/groups/{groupId}/projects")
public class ProjectController {

  private final ProjectService projectService;
  private final GroupService groupService;

  // 등록 가능한 멤버 리스트 조회 - 그룹 내 프로젝트에 없는 멤버 권한 유저
  @GetMapping("/users")
  @GroupRoleCheck(Role.MANAGER)
  public ApiResponse<List<GroupUserResponse>> getUsers(
      @AuthenticationPrincipal CustomUserDetails customUserDetails,
      @PathVariable("groupId") Integer groupId) {

    // 유저 오너/매니저 권한 확인
    User user = customUserDetails.getUser();

    return ApiResponse.success(projectService.getMemberUsers(groupId));
  }

  // 프로젝트 생성
  @PostMapping()
  @GroupRoleCheck(Role.MANAGER)
  public ApiResponse<Project> createProject(
      @AuthenticationPrincipal CustomUserDetails customUserDetails,
      @PathVariable("groupId") Integer groupId,
      @RequestBody ProjectCreateRequest request) {

    // 유저 오너/매니저 권한 확인
    User user = customUserDetails.getUser();

    return ApiResponse.success(projectService.createProject(groupId, request));
  }

  // 그룹 내 참여중인 프로젝트 리스트 조회

  // 프로젝트 상세 조회

  @RestController
  @RequestMapping("/v1/projects")
  public class OptionController {

    // 사용 가능한 언어 리스트 조회
    @GetMapping("/language")
    public ApiResponse<List<ProjectLanguageDto>> getLanguage() {
      return ApiResponse.success(projectService.getLanguage());
    }

    // 사용 가능한 OS 리스트 조회
    @GetMapping("/os")
    public ApiResponse<List<ProjectOSDto>> getOS(@RequestParam String language) {
      return ApiResponse.success(projectService.getOS(language));
    }

    // 사용 가능한 사양 리스트 조회
    @GetMapping("/performance")
    public ApiResponse<List<ProjectPerformanceDto>> getPerformance() {
      return ApiResponse.success(projectService.getPerformance());
    }
  }
}