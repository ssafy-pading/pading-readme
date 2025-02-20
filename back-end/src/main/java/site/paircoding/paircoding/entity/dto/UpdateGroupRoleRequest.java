package site.paircoding.paircoding.entity.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;
import site.paircoding.paircoding.entity.enums.Role;

@Getter
@Setter
public class UpdateGroupRoleRequest {

  @NotNull(message = "Role cannot be null")
  private Role role;
}
