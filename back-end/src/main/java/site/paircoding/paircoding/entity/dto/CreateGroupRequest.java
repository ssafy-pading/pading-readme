package site.paircoding.paircoding.entity.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CreateGroupRequest {

  @NotBlank(message = "그룹 이름은 필수입니다.")
  @Size(min = 3, max = 15, message = "그룹 이름은 3자에서 15자 사이여야 합니다.")
  @Pattern(regexp = "^[a-zA-Z0-9]*$", message = "그룹 이름은 특수 문자를 포함할 수 없습니다.")
  private String name;

  @Min(value = 2, message = "그룹 용량은 최소 2명 이상이어야 합니다.")
  @Max(value = 100, message = "그룹 용량은 최대 100명 이하이어야 합니다.")
  private int capacity;
}