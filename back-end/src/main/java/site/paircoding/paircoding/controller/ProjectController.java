package site.paircoding.paircoding.controller;

import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import site.paircoding.paircoding.annotaion.GroupRoleCheck;
import site.paircoding.paircoding.annotaion.LoginUser;
import site.paircoding.paircoding.entity.Project;
import site.paircoding.paircoding.entity.User;
import site.paircoding.paircoding.entity.dto.GroupUserResponse;
import site.paircoding.paircoding.entity.dto.ProjectCreateRequest;
import site.paircoding.paircoding.entity.dto.ProjectWithUsersResponse;
import site.paircoding.paircoding.entity.enums.Role;
import site.paircoding.paircoding.global.ApiResponse;
import site.paircoding.paircoding.service.ProjectService;

@RestController
@RequestMapping("/v1/groups/{groupId}/projects")
@RequiredArgsConstructor
public class ProjectController {

  private final ProjectService projectService;

  // 등록 가능한 멤버 리스트 조회 - 그룹 내 프로젝트에 없는 멤버 권한 유저
  @GetMapping("/users")
  @GroupRoleCheck(Role.MANAGER)
  public ApiResponse<List<GroupUserResponse>> getUsers(
      @PathVariable("groupId") Integer groupId) {
    return ApiResponse.success(projectService.getMemberUsers(groupId));
  }

  // 프로젝트 생성
  @PostMapping()
  @GroupRoleCheck(Role.MANAGER)
  public ApiResponse<Project> createProject(
      @PathVariable("groupId") Integer groupId,
      @Valid @RequestBody ProjectCreateRequest request) {
    return ApiResponse.success(projectService.createProject(groupId, request));
  }

  // 그룹 내 참여중인 프로젝트 리스트 조회
  @GetMapping()
  @GroupRoleCheck(Role.MEMBER)
  public ApiResponse<List<ProjectWithUsersResponse>> getProjects(@LoginUser User user,
      @PathVariable("groupId") Integer groupId) {
    return ApiResponse.success(projectService.getProjects(user, groupId));
  }

  // 프로젝트 상세 조회
  @GetMapping("/{projectId}")
  @GroupRoleCheck(Role.MEMBER)
  public ApiResponse<ProjectWithUsersResponse> getProject(@LoginUser User user,
      @PathVariable("groupId") Integer groupId, @PathVariable("projectId") Integer projectId) {
    return ApiResponse.success(projectService.getDetailProject(user, groupId, projectId));
  }

  // 프로젝트 삭제
  @DeleteMapping("/{projectId}")
  @GroupRoleCheck(Role.MANAGER)
  public ApiResponse<?> deleteProject(@LoginUser User user,
      @PathVariable("groupId") Integer groupId, @PathVariable("projectId") Integer projectId) {
    projectService.deleteProject(groupId, projectId);
    return ApiResponse.success();
  }

  @GroupRoleCheck(Role.MEMBER)
  @GetMapping("/{projectId}/status")
  public ApiResponse<?> getProjectUserStatus(@LoginUser User user,
      @PathVariable("groupId") Integer groupId, @PathVariable("projectId") Integer projectId) {
    return ApiResponse.success(projectService.getProjectUserIds(groupId, projectId));
  }
}