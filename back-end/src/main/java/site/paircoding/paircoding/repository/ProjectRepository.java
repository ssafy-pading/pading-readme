package site.paircoding.paircoding.repository;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import site.paircoding.paircoding.entity.Project;

public interface ProjectRepository extends JpaRepository<Project, Integer> {

  @Query("select p from Project p where p.group.id = :groupId and p.id = :projectId")
  Optional<Project> findByGroupIdAndProjectId(Integer groupId, Integer projectId);

  List<Project> findByGroupId(Integer groupId);

  List<Project> findAllByGroupId(Integer groupId);
}
