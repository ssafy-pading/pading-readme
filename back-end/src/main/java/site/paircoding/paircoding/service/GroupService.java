package site.paircoding.paircoding.service;

import jakarta.transaction.Transactional;
import java.util.ArrayList;
import java.util.List;
import java.util.UnknownFormatConversionException;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient.Builder;
import site.paircoding.paircoding.entity.Group;
import site.paircoding.paircoding.entity.GroupUser;
import site.paircoding.paircoding.entity.User;
import site.paircoding.paircoding.entity.dto.CreateGroupResponse;
import site.paircoding.paircoding.entity.dto.GroupUserResponse;
import site.paircoding.paircoding.entity.dto.GroupUserRoleDto;
import site.paircoding.paircoding.entity.dto.UserDto;
import site.paircoding.paircoding.entity.enums.Role;
import site.paircoding.paircoding.global.error.ErrorCode;
import site.paircoding.paircoding.global.exception.BadRequestException;
import site.paircoding.paircoding.global.exception.NotFoundException;
import site.paircoding.paircoding.global.exception.UnauthorizedException;
import site.paircoding.paircoding.repository.GroupRepository;
import site.paircoding.paircoding.repository.GroupUserRepository;
import site.paircoding.paircoding.repository.UserRepository;

@Slf4j
@Service
@RequiredArgsConstructor
public class GroupService {
  private final GroupRepository groupRepository;
  private final GroupUserRepository groupUserRepository;
  private final UserRepository userRepository;
  private final Builder builder;


  public List<Group> getGroups(User user) {
    List<Integer> groupIds = groupUserRepository.findGroupIdByUserId(user.getId());
    return groupRepository.findByIdIn(groupIds);
  }

  @Transactional
  public CreateGroupResponse createGroup(User user, String name, int capacity) {
    if (capacity < 2) {
      throw new BadRequestException("2명 이상의 인원이 필요합니다");
    }
    if (checkDuplicate(name)) {
      throw new BadRequestException("중복된 그룹명입니다.");
    }
    Group group = Group.builder().name(name).capacity(capacity).build();
    Group savedGroup =  groupRepository.save(group);
    GroupUser groupUser = GroupUser.builder().group(savedGroup).user(user).role(Role.OWNER).build();
    groupUserRepository.save(groupUser);
    return CreateGroupResponse.builder().id(savedGroup.getId()).name(savedGroup.getName()).capacity(savedGroup.getCapacity()).build();
  }

  public Group getGroup(User user, Integer groupId) {
    List<Integer> groupIds = groupUserRepository.findGroupIdByUserId(user.getId());
    groupRepository.findById(groupId).orElseThrow(() -> new NotFoundException("Group not found."));

    if (!groupIds.contains(groupId)) {
      throw new UnauthorizedException("Access denied. You do not have permission to view this group.");
    }
    return groupRepository.findById(groupId).orElseThrow(() -> new NotFoundException("Group not found."));
  }

  public boolean checkDuplicate(String name) {
    if(groupRepository.findByName(name).isPresent()) {
      return true;
    }
    return false;
  }

  public Group updateGroup(User user, Integer groupId, String name) {
    Group group = groupRepository.findById(groupId).orElseThrow(() -> new NotFoundException("Group not found."));
    groupUserRepository.findByGroupIdAndUserId(groupId, user.getId()).orElseThrow(() -> new UnauthorizedException("Access denied. You do not have permission to update this group."))
        .getRole().equals(Role.OWNER);
    if (checkDuplicate(name)) {
      throw new BadRequestException("중복된 그룹명입니다.");
    }

    return groupRepository.save(Group.builder().id(groupId).name(name).capacity(group.getCapacity()).build());
  }

  public List<GroupUserResponse> getGroupUsers(User user, Integer groupId) {
    groupRepository.findById(groupId).orElseThrow(() -> new NotFoundException("Group not found."));
    groupUserRepository.findByGroupIdAndUserId(groupId, user.getId()).orElseThrow(() ->  new UnauthorizedException("Access denied. You do not have permission to view this group."));
    List<GroupUserRoleDto> groupUserRoles = groupUserRepository.findUserIdAndRoleByGroupId(groupId);
    List<GroupUserResponse> list = new ArrayList<>();
    for(GroupUserRoleDto groupUserRole : groupUserRoles) {
      User searchedUser = userRepository.findById(groupUserRole.getUserId()).orElseThrow(() -> new NotFoundException("User not found."));;
      list.add(GroupUserResponse.builder().name(searchedUser.getName()).image(searchedUser.getImage()).email(searchedUser.getEmail()).role(groupUserRole.getRole()).build());
    }
    return list;
  }
}
