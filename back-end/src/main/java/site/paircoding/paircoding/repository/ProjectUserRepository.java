package site.paircoding.paircoding.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import site.paircoding.paircoding.entity.Project;
import site.paircoding.paircoding.entity.ProjectUser;
import site.paircoding.paircoding.entity.ProjectUserId;
import site.paircoding.paircoding.entity.User;

public interface ProjectUserRepository extends JpaRepository<ProjectUser, ProjectUserId> {

  List<ProjectUser> findByProject(Project project);

  List<ProjectUser> findByUser(User user);
}
