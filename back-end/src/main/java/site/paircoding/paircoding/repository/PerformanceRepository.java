package site.paircoding.paircoding.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import site.paircoding.paircoding.entity.Performance;

public interface PerformanceRepository extends JpaRepository<Performance, Integer> {

}
