package site.paircoding.paircoding.entity.dto;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;
import site.paircoding.paircoding.entity.enums.Role;

@Getter
@Setter
@Builder
public class GroupUserResponse {

  private Integer id;
  private String name;
  private String image;
  private String email;
  private Role role;
  private String status;
}
