package site.paircoding.paircoding.entity.dto;

import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class ChatDto {

  private String username;
  private String content;
  private LocalDateTime createdAt;
}