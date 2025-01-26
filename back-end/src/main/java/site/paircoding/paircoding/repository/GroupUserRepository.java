package site.paircoding.paircoding.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import site.paircoding.paircoding.entity.GroupUser;

public interface GroupUserRepository extends JpaRepository<GroupUser, Integer> {

}
