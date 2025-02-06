package site.paircoding.paircoding.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import site.paircoding.paircoding.entity.ProjectImage;

public interface ProjectImageRepository extends JpaRepository<ProjectImage, String> {

  @Query("SELECT DISTINCT pi.language FROM ProjectImage pi")
  List<String> findDistinctLanguage();

  @Query("SELECT pi.os FROM ProjectImage pi where pi.language = :language")
  List<String> findOsByLanguage(String language);
}
