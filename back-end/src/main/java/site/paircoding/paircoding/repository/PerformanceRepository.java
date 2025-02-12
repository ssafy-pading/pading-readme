package site.paircoding.paircoding.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import site.paircoding.paircoding.entity.Performance;
import site.paircoding.paircoding.entity.dto.ProjectPerformanceDto;

public interface PerformanceRepository extends JpaRepository<Performance, Integer> {

  @Query("SELECT new site.paircoding.paircoding.entity.dto.ProjectPerformanceDto(p.id, p.cpuDescription, p.memoryDescription, p.storageDescription) FROM Performance p")
  List<ProjectPerformanceDto> findAllPerformance();

}
