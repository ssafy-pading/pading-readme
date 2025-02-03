package site.paircoding.paircoding.entity.dto;

import lombok.Builder;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class DuplicateResponse {
  private boolean duplicated;
}
