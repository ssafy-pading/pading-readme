package site.paircoding.paircoding.entity;

import jakarta.persistence.Embeddable;
import java.io.Serializable;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Embeddable
@Getter
@AllArgsConstructor
@NoArgsConstructor
public class ProjectUserId implements Serializable {

  private Integer userId;
  private Integer projectId;
}
