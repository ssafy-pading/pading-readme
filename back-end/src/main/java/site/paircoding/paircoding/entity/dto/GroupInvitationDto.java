package site.paircoding.paircoding.entity.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class GroupInvitationDto {

  @NotBlank
  private String code;

  private long expirationTime;

  public GroupInvitationDto(String code, long expirationTime) {
    this.code = code;
    this.expirationTime = expirationTime;
  }
}
