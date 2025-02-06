// GroupUserRoleDto.java
package site.paircoding.paircoding.entity.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;
import site.paircoding.paircoding.entity.enums.Role;

@Getter
@Setter
@AllArgsConstructor
public class GroupUserRoleDto {

  private Integer userId;
  private Role role;
}