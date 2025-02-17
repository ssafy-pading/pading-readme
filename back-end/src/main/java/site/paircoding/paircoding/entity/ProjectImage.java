package site.paircoding.paircoding.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import lombok.Getter;

@Entity
@Getter
public class ProjectImage {

  @Id
  @Column(length = 50)
  private String tag;

  @Column(nullable = false, length = 20)
  private String language;

  @Column(nullable = false, length = 20)
  private String os;

  @Column(nullable = false)
  private Integer port;

  @Column(nullable = false)
  private String defaultRunCommand;

}
