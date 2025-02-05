package site.paircoding.paircoding.controller;

import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import site.paircoding.paircoding.config.oauth.CustomUserDetails;
import site.paircoding.paircoding.entity.Group;
import site.paircoding.paircoding.entity.User;
import site.paircoding.paircoding.entity.dto.CreateGroupRequest;
import site.paircoding.paircoding.entity.dto.GroupDto;
import site.paircoding.paircoding.entity.dto.DuplicateResponse;
import site.paircoding.paircoding.entity.dto.GroupInvitationDto;
import site.paircoding.paircoding.entity.dto.GroupUserResponse;
import site.paircoding.paircoding.entity.dto.GroupUsersResponse;
import site.paircoding.paircoding.entity.dto.GroupsResponse;
import site.paircoding.paircoding.entity.dto.UpdateGroupRequest;
import site.paircoding.paircoding.entity.dto.UpdateGroupRoleRequest;
import site.paircoding.paircoding.global.ApiResponse;
import site.paircoding.paircoding.service.GroupService;

@RestController
@RequiredArgsConstructor
@RequestMapping("v1/groups")
public class GroupController {
    private final GroupService groupService;

    @GetMapping
    public ApiResponse<GroupsResponse> getGroups(@AuthenticationPrincipal CustomUserDetails customUserDetails) {
        User user = customUserDetails.getUser();
        List<Group> groups = groupService.getGroups(user);
        GroupsResponse groupsResponse = new GroupsResponse(groups);
        return ApiResponse.success(groupsResponse);
    }

    @PostMapping
    public ApiResponse<GroupDto> createGroup(@AuthenticationPrincipal CustomUserDetails customUserDetails, @RequestBody CreateGroupRequest createGroupRequest) {
        User user = customUserDetails.getUser();
        GroupDto GroupDto = groupService.createGroup(user, createGroupRequest.getName(), createGroupRequest.getCapacity());
        return ApiResponse.success(GroupDto);
    }

    @GetMapping("{groupId}")
    public ApiResponse<Group> getGroup(@AuthenticationPrincipal CustomUserDetails customUserDetails, @PathVariable Integer groupId) {
        User user = customUserDetails.getUser();
        Group group = groupService.getGroup(user, groupId);
        return ApiResponse.success(group);
    }

    @GetMapping("check-duplicate")
    public ApiResponse<DuplicateResponse> checkDuplicate(@RequestParam String name) {
        boolean isDuplicate = groupService.checkDuplicate(name);
        return ApiResponse.success(DuplicateResponse.builder().duplicated(isDuplicate).build());
    }

    @PatchMapping("{groupId}")
    public ApiResponse<Group> updateGroup(@AuthenticationPrincipal CustomUserDetails customUserDetails, @PathVariable Integer groupId, @RequestBody
        UpdateGroupRequest updateGroupRequest) {
        User user = customUserDetails.getUser();
        Group group = groupService.updateGroup(user, groupId, updateGroupRequest.getName());
        return ApiResponse.success(group);
    }

    @DeleteMapping("{groupId}")
    public ApiResponse<Void> deleteGroup(@AuthenticationPrincipal CustomUserDetails customUserDetails, @PathVariable Integer groupId) {
        User user = customUserDetails.getUser();
        groupService.deleteGroup(user, groupId);
        return ApiResponse.success();
    }

    @GetMapping("{groupId}/users")
    public ApiResponse<GroupUsersResponse> getGroupUsers(@AuthenticationPrincipal CustomUserDetails customUserDetails, @PathVariable Integer groupId) {
        User user = customUserDetails.getUser();
        List<GroupUserResponse> users = groupService.getGroupUsers(user, groupId);
        GroupUsersResponse groupUsersResponse = new GroupUsersResponse(users);
        return ApiResponse.success(groupUsersResponse);
    }

    @PostMapping("{groupId}/invitation")
    public ApiResponse<Object> generateInvitation(@AuthenticationPrincipal CustomUserDetails customUserDetails, @PathVariable Integer groupId) {
        GroupInvitationDto groupInvitationDto = groupService.generateInvitation(customUserDetails.getUser(), groupId);
        return ApiResponse.success(groupInvitationDto);
    }

    @PostMapping("{groupId}/join")
    public ApiResponse<Object> joinGroup(@AuthenticationPrincipal CustomUserDetails customUserDetails, @PathVariable Integer groupId, @RequestBody GroupInvitationDto groupInvitationDto) {
        User user = customUserDetails.getUser();
        Group group = groupService.joinGroup(user, groupId, groupInvitationDto.getCode());
        return ApiResponse.success(GroupDto.builder().id(group.getId()).name(group.getName()).capacity(group.getCapacity()).build());
    }

    @DeleteMapping("{groupId}/quit")
    public ApiResponse<Void> quitGroup(@AuthenticationPrincipal CustomUserDetails customUserDetails, @PathVariable Integer groupId) {
        User user = customUserDetails.getUser();
        groupService.quitGroup(user, groupId);
        return ApiResponse.success();
    }

    @PatchMapping("{groupId}/users/{userId}")
    public ApiResponse<GroupUserResponse> updateGroupUserRole(@AuthenticationPrincipal CustomUserDetails customUserDetails, @PathVariable Integer groupId, @PathVariable Integer userId, @RequestBody UpdateGroupRoleRequest updateGroupRoleRequest) {
        User user = customUserDetails.getUser();
        GroupUserResponse groupUserResponse = groupService.updateGroupUserRole(user, groupId, userId, updateGroupRoleRequest.getRole());
        return ApiResponse.success(groupUserResponse);
    }

    @DeleteMapping("{groupId}/users/{userId}")
    public ApiResponse<Void> deleteGroupUser(@AuthenticationPrincipal CustomUserDetails customUserDetails, @PathVariable Integer groupId, @PathVariable Integer userId) {
        User user = customUserDetails.getUser();
        groupService.deleteGroupUser(user, groupId, userId);
        return ApiResponse.success();
    }

}
