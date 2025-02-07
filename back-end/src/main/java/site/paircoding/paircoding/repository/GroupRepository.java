package site.paircoding.paircoding.repository;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import site.paircoding.paircoding.entity.Group;

public interface GroupRepository extends JpaRepository<Group, Integer> {

  List<Group> findByIdIn(List<Integer> groupIds);

  Optional<Object> findByName(String name);
}
