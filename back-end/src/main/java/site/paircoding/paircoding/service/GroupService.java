package site.paircoding.paircoding.service;

import jakarta.transaction.Transactional;
import java.util.ArrayList;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import site.paircoding.paircoding.entity.Group;
import site.paircoding.paircoding.entity.GroupUser;
import site.paircoding.paircoding.entity.User;
import site.paircoding.paircoding.entity.dto.GroupDto;
import site.paircoding.paircoding.entity.dto.GroupInvitationDto;
import site.paircoding.paircoding.entity.dto.GroupUserResponse;
import site.paircoding.paircoding.entity.dto.GroupUserRoleDto;
import site.paircoding.paircoding.entity.enums.Role;
import site.paircoding.paircoding.global.exception.BadRequestException;
import site.paircoding.paircoding.global.exception.NotFoundException;
import site.paircoding.paircoding.global.exception.UnauthorizedException;
import site.paircoding.paircoding.repository.GroupRepository;
import site.paircoding.paircoding.repository.GroupUserRepository;
import site.paircoding.paircoding.repository.UserRepository;
import site.paircoding.paircoding.util.RandomUtil;
import site.paircoding.paircoding.util.RedisUtil;

@Slf4j
@Service
@RequiredArgsConstructor
public class GroupService {

  private final GroupRepository groupRepository;
  private final GroupUserRepository groupUserRepository;
  private final UserRepository userRepository;
  private final RedisUtil redisUtil;
  private static final String INVITATION_PREFIX = "groupId=%d";

  @Value("${link.expire-time}")
  private long LINK_EXPIRE_TIME;

  public List<Group> getGroups(User user) {
    List<Integer> groupIds = groupUserRepository.findGroupIdByUserId(user.getId());
    return groupRepository.findByIdIn(groupIds);
  }

  @Transactional
  public GroupDto createGroup(User user, String name, int capacity) {
    if (capacity < 2) {
      throw new BadRequestException("2명 이상의 인원이 필요합니다");
    }
    if (checkDuplicate(name)) {
      throw new BadRequestException("중복된 그룹명입니다.");
    }
    Group group = Group.builder().name(name).capacity(capacity).build();
    Group savedGroup = groupRepository.save(group);
    GroupUser groupUser = GroupUser.builder().group(savedGroup).user(user).role(Role.OWNER).build();
    groupUserRepository.save(groupUser);
    return GroupDto.builder().id(savedGroup.getId()).name(savedGroup.getName())
        .capacity(savedGroup.getCapacity()).build();
  }

  public Group getGroup(User user, Integer groupId) {
    groupRepository.findById(groupId).orElseThrow(() -> new NotFoundException("Group not found."));

    return groupRepository.findById(groupId)
        .orElseThrow(() -> new NotFoundException("Group not found."));
  }

  public boolean checkDuplicate(String name) {
    return groupRepository.findByName(name).isPresent();
  }

  public Group updateGroup(User user, Integer groupId, String name) {
    Group group = groupRepository.findById(groupId)
        .orElseThrow(() -> new NotFoundException("Group not found."));
    GroupUser groupUser = groupUserRepository.findByGroupIdAndUserId(groupId, user.getId())
        .orElseThrow(() -> new UnauthorizedException(
            "Access denied. You do not have permission to update this group."));
    if (!groupUser.getRole().equals(Role.OWNER)) {
      throw new UnauthorizedException(
          "Access denied. You do not have permission to update this group.");
    }
    if (checkDuplicate(name)) {
      throw new BadRequestException("중복된 그룹명입니다.");
    }

    return groupRepository.save(
        Group.builder().id(groupId).name(name).capacity(group.getCapacity()).build());
  }

  @Transactional
  public void deleteGroup(User user, Integer groupId) {
    Group group = groupRepository.findById(groupId)
        .orElseThrow(() -> new NotFoundException("Group not found."));
    GroupUser groupUser = groupUserRepository.findByGroupIdAndUserId(groupId, user.getId())
        .orElseThrow(() -> new UnauthorizedException(
            "Access denied. You do not have permission to delete this group."));
    if (!groupUser.getRole().equals(Role.OWNER)) {
      throw new UnauthorizedException(
          "Access denied. You do not have permission to delete this group.");
    }
    groupUserRepository.deleteAllByGroupId(groupId);
    groupRepository.delete(group);
  }

  public List<GroupUserResponse> getGroupUsers(User user, Integer groupId) {
    groupRepository.findById(groupId).orElseThrow(() -> new NotFoundException("Group not found."));
    groupUserRepository.findByGroupIdAndUserId(groupId, user.getId()).orElseThrow(
        () -> new UnauthorizedException(
            "Access denied. You do not have permission to view this group."));
    List<GroupUserRoleDto> groupUserRoles = groupUserRepository.findUserIdAndRoleByGroupId(groupId);
    List<GroupUserResponse> list = new ArrayList<>();
    for (GroupUserRoleDto groupUserRole : groupUserRoles) {
      User searchedUser = userRepository.findById(groupUserRole.getUserId())
          .orElseThrow(() -> new NotFoundException("User not found."));

      list.add(GroupUserResponse.builder()
          .id(searchedUser.getId())
          .name(searchedUser.getName())
          .image(searchedUser.getImage())
          .email(searchedUser.getEmail())
          .role(groupUserRole.getRole())
          .build());
    }
    return list;
  }

  public void quitGroup(User user, Integer groupId) {
    groupRepository.findById(groupId).orElseThrow(() -> new NotFoundException("Group not found."));
    GroupUser groupUser = groupUserRepository.findByGroupIdAndUserId(groupId, user.getId())
        .orElseThrow(() -> new UnauthorizedException(
            "Access denied. You do not have permission to quit this group."));
    if (groupUser.getRole().equals(Role.OWNER)) {
      throw new BadRequestException("그룹장은 그룹을 탈퇴할 수 없습니다.");
    }
    groupUserRepository.delete(groupUser);
  }

  public GroupInvitationDto getInvitation(User user, Integer groupId) {
    groupRepository.findById(groupId).orElseThrow(() -> new NotFoundException("Group not found."));
    GroupUser groupUser = groupUserRepository.findByGroupIdAndUserId(groupId, user.getId())
        .orElseThrow(() -> new UnauthorizedException(
            "Access denied. You do not have permission to view invitation code."));
    if (groupUser.getRole().equals(Role.MEMBER)) {
      throw new UnauthorizedException(
          "Access denied. You do not have permission to view invitation code.");
    }
    String link = (String) redisUtil.get(INVITATION_PREFIX.formatted(groupId));
    if (link == null) {
      throw new NotFoundException("Invitation code not found.");
    }
    long expirationTime = redisUtil.getExpire(INVITATION_PREFIX.formatted(groupId));

    return new GroupInvitationDto(link, expirationTime);
  }

  public GroupInvitationDto generateInvitation(User user, Integer groupId) {
    groupRepository.findById(groupId).orElseThrow(() -> new NotFoundException("Group not found."));
    GroupUser groupUser = groupUserRepository.findByGroupIdAndUserId(groupId, user.getId())
        .orElseThrow(() -> new UnauthorizedException(
            "Access denied. You do not have permission to generate invitation code."));
    if (groupUser.getRole().equals(Role.MEMBER)) {
      throw new UnauthorizedException(
          "Access denied. You do not have permission to generate invitation code.");
    }
    String link = (String) redisUtil.get(INVITATION_PREFIX.formatted(groupId));
    if (link != null) {
      throw new BadRequestException("이미 초대 코드가 생성되었습니다.");
    }
    String randomCode = RandomUtil.generateRandomCode('0', 'z', 10);
    redisUtil.setex(INVITATION_PREFIX.formatted(groupId), randomCode, LINK_EXPIRE_TIME);
    return new GroupInvitationDto(randomCode, LINK_EXPIRE_TIME);
  }

  public Group joinGroup(User user, Integer groupId, String code) {
    Group group = groupRepository.findById(groupId)
        .orElseThrow(() -> new NotFoundException("Group not found."));

    String redisCode = (String) redisUtil.get(INVITATION_PREFIX.formatted(groupId));
    if (redisCode == null || !redisCode.equals(code)) {
      throw new BadRequestException("유효하지 않은 초대 코드입니다.");
    }
    if (groupUserRepository.findByGroupIdAndUserId(groupId, user.getId()).isPresent()) {
      throw new BadRequestException("이미 가입한 그룹입니다.");
    }
    if (groupUserRepository.countByGroupId(groupId) >= group.getCapacity()) {
      throw new BadRequestException("정원이 초과되었습니다.");
    }
    GroupUser groupUser = GroupUser.builder().group(group).user(user).role(Role.MEMBER).build();
    groupUserRepository.save(groupUser);
    return group;
  }

  public GroupUserResponse updateGroupUserRole(User user, Integer groupId, Integer userId,
      Role role) {
    if (user.getId().equals(userId)) {
      throw new BadRequestException("자신의 권한은 변경할 수 없습니다.");
    }
    groupRepository.findById(groupId).orElseThrow(() -> new NotFoundException("Group not found."));
    GroupUser currentUser = groupUserRepository.findByGroupIdAndUserId(groupId, user.getId())
        .orElseThrow(() -> new UnauthorizedException(
            "Access denied. You do not have permission to update this group."));
    GroupUser targetUser = groupUserRepository.findByGroupIdAndUserId(groupId, userId)
        .orElseThrow(() -> new NotFoundException("User not found."));

    if (currentUser.getRole().equals(Role.OWNER)) {
      if (role.equals(Role.OWNER)) {
        currentUser.setRole(Role.MANAGER);
      }
      targetUser.setRole(role);
    } else if (currentUser.getRole().equals(Role.MANAGER)) {
      if (!targetUser.getRole().equals(Role.MEMBER) || !role.equals(Role.MANAGER)) {
        throw new UnauthorizedException(
            "Access denied. You do not have permission to update this role.");
      }
      targetUser.setRole(Role.MANAGER);
    } else {
      throw new UnauthorizedException(
          "Access denied. You do not have permission to update this role.");
    }

    groupUserRepository.save(currentUser);
    groupUserRepository.save(targetUser);
    User searchedUser = userRepository.findById(userId)
        .orElseThrow(() -> new NotFoundException("User not found."));
    return GroupUserResponse.builder().name(searchedUser.getName()).image(searchedUser.getImage())
        .email(searchedUser.getEmail()).role(targetUser.getRole()).build();
  }

  public void deleteGroupUser(User user, Integer groupId, Integer userId) {
    if (user.getId().equals(userId)) {
      throw new BadRequestException("자신을 추방할 수 없습니다.");
    }
    groupRepository.findById(groupId).orElseThrow(() -> new NotFoundException("Group not found."));
    GroupUser currentUser = groupUserRepository.findByGroupIdAndUserId(groupId, user.getId())
        .orElseThrow(() -> new UnauthorizedException(
            "Access denied. You do not have permission to delete this user."));
    GroupUser targetUser = groupUserRepository.findByGroupIdAndUserId(groupId, userId)
        .orElseThrow(() -> new NotFoundException("User not found."));

    if (currentUser.getRole().equals(Role.MEMBER)) {
      throw new UnauthorizedException(
          "Access denied. You do not have permission to delete this user.");
    } else if (currentUser.getRole().equals(Role.MANAGER)) {
      if (targetUser.getRole().equals(Role.OWNER) || targetUser.getRole().equals(Role.MANAGER)) {
        throw new UnauthorizedException(
            "Access denied. You do not have permission to delete this user.");
      }
    }
    groupUserRepository.delete(targetUser);
  }

}
