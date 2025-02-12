package site.paircoding.paircoding.entity.dto;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class ProjectUserDto {

  private Integer id;
  private String name;
  private String image;
  private String email;
  private Boolean status;
}
