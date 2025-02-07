package site.paircoding.paircoding.repository;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import site.paircoding.paircoding.entity.GroupUser;

public interface GroupUserRepository extends JpaRepository<GroupUser, Integer> {

  Optional<List<GroupUser>> findGroupUserByUserId(Integer userId);

  Optional<List<GroupUser>> findGroupUserByGroupId(Integer groupId);

  Optional<GroupUser> findByGroupIdAndUserId(Integer groupId, Integer userId);

  Integer countByGroupId(Integer groupId);

  void deleteAllByGroupId(Integer groupId);
}
