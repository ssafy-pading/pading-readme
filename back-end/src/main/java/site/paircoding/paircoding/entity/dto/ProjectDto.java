package site.paircoding.paircoding.entity.dto;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Builder
@Getter
@Setter
public class ProjectDto {

  private Integer id;
  private String name;
  private String containerId;
  private Boolean status;
  private Boolean autoStop;
  private Boolean isDeleted;
}
