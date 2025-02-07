package site.paircoding.paircoding.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.Getter;

@Entity
@Getter
public class Performance {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Integer id;

  @Column(nullable = false)
  private String cpu;

  @Column(nullable = false)
  private String cpuDescription;

  @Column(nullable = false)
  private String memory;

  @Column(nullable = false)
  private String memoryDescription;

  @Column(nullable = false)
  private String storage;

  @Column(nullable = false)
  private String storageDescription;

}
