package site.paircoding.paircoding.entity.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class MypageDto {
  private String name;
  private String image;
  private String email;
}
