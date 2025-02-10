package site.paircoding.paircoding.service;

import jakarta.transaction.Transactional;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;
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
import site.paircoding.paircoding.entity.enums.Role;
import site.paircoding.paircoding.global.exception.BadRequestException;
import site.paircoding.paircoding.global.exception.NotFoundException;
import site.paircoding.paircoding.global.exception.UnauthorizedException;
import site.paircoding.paircoding.repository.GroupRepository;
import site.paircoding.paircoding.repository.GroupUserRepository;
import site.paircoding.paircoding.util.RandomUtil;
import site.paircoding.paircoding.util.RedisUtil;

@Slf4j
@Service
@RequiredArgsConstructor
public class GroupService {

  private final GroupRepository groupRepository;
  private final GroupUserRepository groupUserRepository;
  private final RedisUtil redisUtil;
  private static final String INVITATION_PREFIX = "groupId=%d";

  @Value("${link.expire-time}")
  private long LINK_EXPIRE_TIME;

  //내가 속한 그룹 목록 불러오기
  public List<Group> getGroups(User user) {
    //참여중인 그룹 목록 조회
    List<GroupUser> groupUsers = groupUserRepository.findGroupUserByUserId(user.getId())
        .orElseThrow(() -> new NotFoundException("Group not found."));

    // 그룹 목록 반환
    return groupUsers.stream()
        .map(GroupUser::getGroup)
        .collect(Collectors.toList());
  }

  //그룹 생성
  @Transactional
  public GroupDto createGroup(User user, String name, int capacity) {
    if (capacity < 2) {
      throw new BadRequestException("2명 이상의 인원이 필요합니다");
    }
    if (checkDuplicate(name)) {
      throw new BadRequestException("중복된 그룹명입니다.");
    }

    //그룹 생성
    Group savedGroup = groupRepository.save(Group.builder()
        .name(name)
        .capacity(capacity)
        .build());

    //그룹 생성자를 그룹장으로 등록
    groupUserRepository.save(GroupUser.builder()
        .group(savedGroup)
        .user(user)
        .role(Role.OWNER)
        .build());

    return GroupDto.builder()
        .id(savedGroup.getId())
        .name(savedGroup.getName())
        .capacity(savedGroup.getCapacity())
        .build();
  }

  //그룹 상세 정보 조회
  public Group getGroup(Integer groupId) {
    //그룹 조회
    return groupRepository.findById(groupId)
        .orElseThrow(() -> new NotFoundException("Group not found."));
  }

  //그룹명 중복 체크
  public boolean checkDuplicate(String name) {
    return groupRepository.findByName(name).isPresent();
  }

  //그룹 정보 수정
  public Group updateGroup(Integer groupId, String name) {

    Group group = groupRepository.findById(groupId)
        .orElseThrow(() -> new NotFoundException("Group not found."));

    //그룹명 중복 체크
    if (checkDuplicate(name)) {
      throw new BadRequestException("중복된 그룹명입니다.");
    }

    group.setName(name);

    //그룹 정보 수정
    return groupRepository.save(group);
  }

  //그룹 삭제
  @Transactional
  public void deleteGroup(Integer groupId) {

    //그룹 삭제
    groupRepository.deleteById(groupId);
  }

  //그룹 탈퇴
  public void quitGroup(User user, Integer groupId) {

    //그룹에 속해있는지 확인
    GroupUser groupUser = groupUserRepository.findByGroupIdAndUserId(groupId, user.getId())
        .orElseThrow(() -> new UnauthorizedException(
            "Access denied. You do not have permission to quit this group."));

    //그룹장인지 확인
    if (groupUser.getRole().equals(Role.OWNER)) {
      throw new BadRequestException("그룹장은 그룹을 탈퇴할 수 없습니다.");
    }
    groupUserRepository.delete(groupUser);
  }

  //그룹 멤버 목록 조회
  public List<GroupUserResponse> getGroupUsers(Integer groupId) {

    //그룹 멤버 목록 Role 조회
    List<GroupUser> groupUsers = groupUserRepository.findGroupUserByGroupId(groupId)
        .orElseThrow(() -> new NotFoundException("Group not found."));

    List<GroupUserResponse> list = new ArrayList<>();

    for (GroupUser groupUser : groupUsers) {
      User searchedUser = groupUser.getUser();

      list.add(GroupUserResponse.builder()
          .id(searchedUser.getId())
          .name(searchedUser.getName())
          .image(searchedUser.getImage())
          .email(searchedUser.getEmail())
          .role(groupUser.getRole())
          .build());
    }
    return list;
  }

  //그룹 초대 코드 조회
  public GroupInvitationDto getInvitation(Integer groupId) {

    //redis에 초대 코드가 있는지 확인
    String link = (String) redisUtil.get(INVITATION_PREFIX.formatted(groupId));
    if (link == null) {
      throw new NotFoundException("Invitation code not found.");
    }

    //redis에 초대 코드의 만료 시간 조회
    long expirationTime = redisUtil.getExpire(INVITATION_PREFIX.formatted(groupId));

    return new GroupInvitationDto(link, expirationTime);
  }

  //그룹 초대 코드 생성
  public GroupInvitationDto generateInvitation(Integer groupId) {

    //redis에 이미 초대 코드가 있는지 확인
    String link = (String) redisUtil.get(INVITATION_PREFIX.formatted(groupId));
    if (link != null) {
      throw new BadRequestException("이미 초대 코드가 생성되었습니다.");
    }

    //초대 코드 생성
    String randomCode = RandomUtil.generateRandomCode('0', 'z', 10);

    //redis에 초대코드를 만료시간과 함께 저장
    redisUtil.setex(INVITATION_PREFIX.formatted(groupId), randomCode, LINK_EXPIRE_TIME);

    return new GroupInvitationDto(randomCode, LINK_EXPIRE_TIME);
  }

  //그룹 가입
  public Group joinGroup(User user, Integer groupId, String code) {
    //그룹 조회
    Group group = groupRepository.findById(groupId)
        .orElseThrow(() -> new NotFoundException("Group not found."));
    if (code == null) {
      throw new BadRequestException("초대 코드를 입력해주세요.");
    }
    //redis에 초대 코드 가져오기
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

    //그룹 가입
    GroupUser groupUser = GroupUser.builder()
        .group(group)
        .user(user)
        .role(Role.MEMBER)
        .build();
    groupUserRepository.save(groupUser);
    return group;
  }

  //그룹 멤버 Role 수정
  public GroupUserResponse updateGroupUserRole(User user, Integer groupId, Integer userId,
      Role role) {
    if (user.getId().equals(userId)) {
      throw new BadRequestException("자신의 권한은 변경할 수 없습니다.");
    }

    //로그인 유저의 권한 확인
    GroupUser currentUser = groupUserRepository.findByGroupIdAndUserId(groupId, user.getId())
        .orElseThrow(() -> new UnauthorizedException(
            "Access denied. You do not have permission to update this group."));

    //대상 유저의 권한 확인
    GroupUser targetUser = groupUserRepository.findByGroupIdAndUserId(groupId, userId)
        .orElseThrow(() -> new NotFoundException("User not found."));

    //그룹장인 경우
    if (currentUser.getRole().equals(Role.OWNER)) {
      //그룹장을 양도 하는 경우
      if (role.equals(Role.OWNER)) {
        //그룹장의 권한을 매니저로 변경
        currentUser.setRole(Role.MANAGER);
      }

      //대상 유저의 권한 변경
      targetUser.setRole(role);

      //매니저인 경우
    } else if (currentUser.getRole().equals(Role.MANAGER)) {
      //매니저는 일반 멤버를 매니저로 승격할 수만 있음
      if (!targetUser.getRole().equals(Role.MEMBER) || !role.equals(Role.MANAGER)) {
        throw new UnauthorizedException(
            "Access denied. You do not have permission to update this role.");
      }
      targetUser.setRole(Role.MANAGER);
    }

    //권한 변경 저장
    groupUserRepository.save(currentUser);
    groupUserRepository.save(targetUser);

    User searchedUser = targetUser.getUser();

    return GroupUserResponse.builder()
        .id(searchedUser.getId())
        .name(searchedUser.getName())
        .image(searchedUser.getImage())
        .email(searchedUser.getEmail())
        .role(targetUser.getRole())
        .build();
  }

  //그룹 멤버 추방
  public void deleteGroupUser(User user, Integer groupId, Integer userId) {
    if (user.getId().equals(userId)) {
      throw new BadRequestException("자신을 추방할 수 없습니다.");
    }

    //로그인 유저의 권한 확인
    GroupUser currentUser = groupUserRepository.findByGroupIdAndUserId(groupId, user.getId())
        .orElseThrow(() -> new UnauthorizedException(
            "Access denied. You do not have permission to delete this user."));

    //대상 유저의 권한 확인
    GroupUser targetUser = groupUserRepository.findByGroupIdAndUserId(groupId, userId)
        .orElseThrow(() -> new NotFoundException("User not found."));

    // 로그인 유저가 MANAGER인 경우
    if (currentUser.getRole().equals(Role.MANAGER)) {
      //대상 유저가 OWNER, MANAGER인 경우 추방 불가
      if (targetUser.getRole().equals(Role.OWNER) || targetUser.getRole().equals(Role.MANAGER)) {
        throw new UnauthorizedException(
            "Access denied. You do not have permission to delete this user.");
      }
    }

    //그룹 멤버 추방
    groupUserRepository.delete(targetUser);
  }

}
