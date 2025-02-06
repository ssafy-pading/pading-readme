package site.paircoding.paircoding.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import site.paircoding.paircoding.entity.Project;

public interface ProjectRepository extends JpaRepository<Project, Integer> {

}
