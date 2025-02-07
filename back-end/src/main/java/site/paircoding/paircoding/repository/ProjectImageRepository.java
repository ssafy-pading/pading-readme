package site.paircoding.paircoding.repository;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import site.paircoding.paircoding.entity.ProjectImage;
import site.paircoding.paircoding.entity.dto.ProjectLanguageDto;
import site.paircoding.paircoding.entity.dto.ProjectOSDto;

public interface ProjectImageRepository extends JpaRepository<ProjectImage, String> {

  @Query("SELECT DISTINCT new site.paircoding.paircoding.entity.dto.ProjectLanguageDto(pi.language) FROM ProjectImage pi")
  List<ProjectLanguageDto> findDistinctLanguage();

  @Query("SELECT new site.paircoding.paircoding.entity.dto.ProjectOSDto(pi.os) FROM ProjectImage pi where pi.language = :language")
  List<ProjectOSDto> findOsByLanguage(String language);

  Optional<ProjectImage> findByLanguageAndOs(String language, String os);
}
