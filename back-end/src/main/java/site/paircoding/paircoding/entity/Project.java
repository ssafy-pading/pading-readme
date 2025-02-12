package site.paircoding.paircoding.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.ToString;

@Entity
@Getter
@ToString
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Project extends BaseEntity {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Integer id;

  @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "group_id", nullable = false)
  private Group group;

  @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "image_tag", nullable = false)
  private ProjectImage projectImage;

  @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "performance_id", nullable = false)
  private Performance performance;

  @Column(nullable = false, length = 30)
  private String name;

  @Column(nullable = false)
  private String containerId;

  @Column(nullable = false)
  private Boolean status;

  @Column(nullable = false)
  private Boolean autoStop;

  @Column(nullable = false)
  private Boolean isDeleted;

  @PrePersist
  public void prePersist() {
    if (status == null) {
      status = true;
    }
    if (autoStop == null) {
      autoStop = false;
    }
    if (isDeleted == null) {
      isDeleted = false;
    }
  }

  @Builder
  public Project(Group group, ProjectImage projectImage, Performance performance, String name,
      String containerId, Boolean status, Boolean autoStop, Boolean isDeleted) {
    this.group = group;
    this.projectImage = projectImage;
    this.performance = performance;
    this.name = name;
    this.containerId = containerId;
    this.status = (status != null) ? status : true;
    this.autoStop = (autoStop != null) ? autoStop : false;
    this.isDeleted = (isDeleted != null) ? isDeleted : false;
  }
}
