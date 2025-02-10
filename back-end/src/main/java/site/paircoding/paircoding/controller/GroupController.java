package site.paircoding.paircoding.controller;

import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import site.paircoding.paircoding.annotaion.GroupRoleCheck;
import site.paircoding.paircoding.annotaion.LoginCheck;
import site.paircoding.paircoding.annotaion.LoginUser;
import site.paircoding.paircoding.entity.Group;
import site.paircoding.paircoding.entity.User;
import site.paircoding.paircoding.entity.dto.CreateGroupRequest;
import site.paircoding.paircoding.entity.dto.DuplicateResponse;
import site.paircoding.paircoding.entity.dto.GroupDto;
import site.paircoding.paircoding.entity.dto.GroupInvitationDto;
import site.paircoding.paircoding.entity.dto.GroupUserResponse;
import site.paircoding.paircoding.entity.dto.GroupUsersResponse;
import site.paircoding.paircoding.entity.dto.GroupsResponse;
import site.paircoding.paircoding.entity.dto.UpdateGroupRequest;
import site.paircoding.paircoding.entity.dto.UpdateGroupRoleRequest;
import site.paircoding.paircoding.entity.enums.Role;
import site.paircoding.paircoding.global.ApiResponse;
import site.paircoding.paircoding.service.GroupService;

@RestController
@RequiredArgsConstructor
@RequestMapping("v1/groups")
public class GroupController {

  private final GroupService groupService;

  @LoginCheck
  @GetMapping
  public ApiResponse<GroupsResponse> getGroups(
      @LoginUser User user) {
    List<Group> groups = groupService.getGroups(user);
    return ApiResponse.success(new GroupsResponse(groups));
  }

  @LoginCheck
  @PostMapping
  public ApiResponse<GroupDto> createGroup(
      @LoginUser User user,
      @RequestBody CreateGroupRequest createGroupRequest) {
    return ApiResponse.success(groupService.createGroup(user, createGroupRequest.getName(),
        createGroupRequest.getCapacity()));
  }

  @GetMapping("{groupId}")
  public ApiResponse<Group> getGroup(@PathVariable("groupId") Integer groupId) {
    return ApiResponse.success(groupService.getGroup(groupId));
  }

  @GetMapping("check-duplicate")
  public ApiResponse<DuplicateResponse> checkDuplicate(@RequestParam String name) {
    boolean isDuplicate = groupService.checkDuplicate(name);
    return ApiResponse.success(DuplicateResponse.builder().duplicated(isDuplicate).build());
  }

  @LoginCheck
  @GroupRoleCheck(Role.OWNER)
  @PatchMapping("{groupId}")
  public ApiResponse<Group> updateGroup(@PathVariable("groupId") Integer groupId,
      @RequestBody UpdateGroupRequest updateGroupRequest) {
    return ApiResponse.success(
        groupService.updateGroup(groupId, updateGroupRequest.getName()));
  }

  @LoginCheck
  @GroupRoleCheck(Role.OWNER)
  @DeleteMapping("{groupId}")
  public ApiResponse<Void> deleteGroup(@PathVariable("groupId") Integer groupId) {
    groupService.deleteGroup(groupId);
    return ApiResponse.success();
  }

  @LoginCheck
  @DeleteMapping("{groupId}/quit")
  public ApiResponse<Void> quitGroup(@LoginUser User user,
      @PathVariable("groupId") Integer groupId) {
    groupService.quitGroup(user, groupId);
    return ApiResponse.success();
  }

  @LoginCheck
  @GroupRoleCheck(Role.MEMBER)
  @GetMapping("{groupId}/users")
  public ApiResponse<GroupUsersResponse> getGroupUsers(@PathVariable("groupId") Integer groupId) {
    List<GroupUserResponse> users = groupService.getGroupUsers(groupId);
    return ApiResponse.success(new GroupUsersResponse(users));
  }

  @LoginCheck
  @GroupRoleCheck(Role.MANAGER)
  @GetMapping("{groupId}/invitation")
  public ApiResponse<Object> gentInvitation(@PathVariable("groupId") Integer groupId) {
    return ApiResponse.success(groupService.getInvitation(groupId));
  }

  @LoginCheck
  @GroupRoleCheck(Role.MANAGER)
  @PostMapping("{groupId}/invitation")
  public ApiResponse<Object> generateInvitation(@PathVariable("groupId") Integer groupId) {
    return ApiResponse.success(groupService.generateInvitation(groupId));
  }

  @LoginCheck
  @PostMapping("{groupId}/join")
  public ApiResponse<Object> joinGroup(@LoginUser User user,
      @PathVariable("groupId") Integer groupId,
      @RequestBody GroupInvitationDto groupInvitationDto) {
    return ApiResponse.success(groupService.joinGroup(user, groupId, groupInvitationDto.getCode()));
  }


  @LoginCheck
  @GroupRoleCheck(Role.MANAGER)
  @PatchMapping("{groupId}/users/{userId}")
  public ApiResponse<GroupUserResponse> updateGroupUserRole(
      @LoginUser User user, @PathVariable("groupId") Integer groupId,
      @PathVariable("userId") Integer userId,
      @RequestBody UpdateGroupRoleRequest updateGroupRoleRequest) {
    return ApiResponse.success(groupService.updateGroupUserRole(user, groupId, userId,
        updateGroupRoleRequest.getRole()));
  }

  @LoginCheck
  @GroupRoleCheck(Role.MANAGER)
  @DeleteMapping("{groupId}/users/{userId}")
  public ApiResponse<Void> deleteGroupUser(
      @LoginUser User user, @PathVariable("groupId") Integer groupId,
      @PathVariable("userId") Integer userId) {
    groupService.deleteGroupUser(user, groupId, userId);
    return ApiResponse.success();
  }

}
