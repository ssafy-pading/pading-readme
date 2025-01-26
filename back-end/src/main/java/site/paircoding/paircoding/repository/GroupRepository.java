package site.paircoding.paircoding.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import site.paircoding.paircoding.entity.Group;

public interface GroupRepository extends JpaRepository<Group, Integer> {

}
