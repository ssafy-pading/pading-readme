package site.paircoding.paircoding.entity.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class GroupInvitationDto {

  String code;

  private long expirationTime;

  public GroupInvitationDto(String code, long expirationTime) {
    this.code = code;
    this.expirationTime = expirationTime;
  }
}
