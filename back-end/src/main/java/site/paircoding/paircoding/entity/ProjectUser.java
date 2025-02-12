package site.paircoding.paircoding.entity;

import jakarta.persistence.Column;
import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.MapsId;
import jakarta.persistence.PrePersist;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@Entity
@Getter
@ToString
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class ProjectUser extends BaseEntity {

  @EmbeddedId
  private ProjectUserId projectUserId;

  @ManyToOne
  @MapsId("userId")
  @JoinColumn(name = "user_id", referencedColumnName = "id")
  private User user;

  @ManyToOne
  @MapsId("projectId")
  @JoinColumn(name = "project_id", referencedColumnName = "id")
  private Project project;

  @Setter
  @Column(nullable = false)
  private Boolean status;

  @PrePersist
  public void prePersist() {
    if (status == null) {
      status = false;
    }
  }

  @Builder
  public ProjectUser(ProjectUserId projectUserId, User user, Project project, Boolean status) {
    this.projectUserId = projectUserId;
    this.user = user;
    this.project = project;
    this.status = (status != null) ? status : false;
  }

}
