package site.paircoding.paircoding.entity.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UpdateGroupRequest {

  @NotBlank(message = "그룹 이름은 필수입니다.")
  @Size(min = 3, max = 15, message = "그룹 이름은 3자에서 15자 사이여야 합니다.")
  @Pattern(regexp = "^[a-zA-Z0-9]*$", message = "그룹 이름은 특수 문자를 포함할 수 없습니다.")
  private String name;
}
