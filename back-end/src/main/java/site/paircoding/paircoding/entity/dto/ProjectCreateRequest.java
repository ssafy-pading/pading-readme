package site.paircoding.paircoding.entity.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import java.util.List;
import lombok.Getter;

@Getter
public class ProjectCreateRequest {

  @Pattern(regexp = "^[a-z0-9][a-z0-9-]{0,19}$", message = "프로젝트명 유효성 검사 실패")
  private String name;
  @NotNull(message = "언어는 필수 입력값입니다.")
  private String language;
  @NotNull(message = "OS는 필수 입력값입니다.")
  private String os;
  @NotNull(message = "성능은 필수 입력값입니다.")
  @Min(value = 1, message = "성능 ID는 1 이상이어야 합니다.")
  private Integer performanceId;
  private List<Integer> userIds;
}
