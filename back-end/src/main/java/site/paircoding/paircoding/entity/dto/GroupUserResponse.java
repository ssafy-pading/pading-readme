package site.paircoding.paircoding.entity.dto;

import lombok.Builder;
import lombok.Data;
import site.paircoding.paircoding.entity.enums.Role;

@Data
@Builder
public class GroupUserResponse {

  private Integer id;
  private String name;
  private String image;
  private String email;
  private Role role;
}
