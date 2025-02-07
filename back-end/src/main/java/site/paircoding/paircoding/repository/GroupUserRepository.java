package site.paircoding.paircoding.repository;

import java.util.List;
import java.util.Optional;
import java.util.Set;
import org.springframework.data.jpa.repository.JpaRepository;
import site.paircoding.paircoding.entity.GroupUser;
import site.paircoding.paircoding.entity.dto.GroupUserRoleDto;
import site.paircoding.paircoding.entity.enums.Role;

public interface GroupUserRepository extends JpaRepository<GroupUser, Integer> {

  @Query("SELECT gu.id.groupId FROM GroupUser gu WHERE gu.id.userId = :userId")
  List<Integer> findGroupIdByUserId(@Param("userId") Integer userId);

  Optional<List<GroupUser>> findGroupUserByUserId(Integer userId);

  Optional<List<GroupUser>> findGroupUserByGroupId(Integer groupId);

  Optional<GroupUser> findByGroupIdAndUserId(Integer groupId, Integer userId);

  Integer countByGroupId(Integer groupId);

  void deleteAllByGroupId(Integer groupId);

  @Query("SELECT gu FROM GroupUser gu WHERE gu.id.groupId = :groupId and gu.role = :role")
  List<GroupUser> findGroupUserByGroupIdAndRole(Integer groupId, Role role);

  @Query("SELECT gu.id.userId FROM GroupUser gu WHERE gu.id.groupId = :groupId and gu.role = :role")
  Set<Integer> findUserIdsByGroupIdAndRole(Integer groupId, Role role);

}
