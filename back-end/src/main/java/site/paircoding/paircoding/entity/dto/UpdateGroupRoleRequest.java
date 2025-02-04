package site.paircoding.paircoding.entity.dto;

import lombok.Getter;
import lombok.Setter;
import site.paircoding.paircoding.entity.enums.Role;

@Getter
@Setter
public class UpdateGroupRoleRequest {
    private Role role;
}
