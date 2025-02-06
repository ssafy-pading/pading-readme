package site.paircoding.paircoding.service;

import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import site.paircoding.paircoding.entity.Performance;
import site.paircoding.paircoding.repository.PerformanceRepository;
import site.paircoding.paircoding.repository.ProjectImageRepository;

@Service
@RequiredArgsConstructor
public class ProjectService {

  private final ProjectImageRepository projectImageRepository;
  private final PerformanceRepository performanceRepository;

  public List<String> getLanguage() {
    return projectImageRepository.findDistinctLanguage();
  }

  public List<String> getOS(String language) {
    return projectImageRepository.findOsByLanguage(language);
  }

  public List<Performance> getPerformance() {
    return performanceRepository.findAll();
  }

}
