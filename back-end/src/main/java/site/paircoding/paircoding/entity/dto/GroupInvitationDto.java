package site.paircoding.paircoding.entity.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class GroupInvitationDto {
  String code;

  public GroupInvitationDto(String code) {
    this.code = code;
  }
}
