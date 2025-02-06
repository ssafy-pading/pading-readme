package site.paircoding.paircoding.repository;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import site.paircoding.paircoding.entity.GroupUser;
import site.paircoding.paircoding.entity.dto.GroupUserRoleDto;

public interface GroupUserRepository extends JpaRepository<GroupUser, Integer> {

  @Query("SELECT gu.id.groupId FROM GroupUser gu WHERE gu.id.userId = :userId")
  List<Integer> findGroupIdByUserId(@Param("userId") Integer userId);

  @Query("SELECT new site.paircoding.paircoding.entity.dto.GroupUserRoleDto(gu.id.userId, gu.role) FROM GroupUser gu WHERE gu.id.groupId = :groupId")
  List<GroupUserRoleDto> findUserIdAndRoleByGroupId(@Param("groupId") Integer groupId);

  Optional<GroupUser> findByGroupIdAndUserId(Integer groupId, Integer userId);

  Integer countByGroupId(Integer groupId);

  void deleteAllByGroupId(Integer groupId);
}
