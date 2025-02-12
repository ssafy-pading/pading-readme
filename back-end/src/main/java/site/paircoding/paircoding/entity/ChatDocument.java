package site.paircoding.paircoding.entity;

import jakarta.persistence.EntityListeners;
import java.time.LocalDateTime;
import lombok.Builder;
import lombok.Data;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@Builder
@Document(collection = "chat")  // MongoDB 컬렉션 이름 설정
@EntityListeners(AuditingEntityListener.class)
public class ChatDocument {

  @Id
  private String id;  // MongoDB 기본 키

  private Integer userId;
  private Integer projectId;     // 프로젝트 ID
  private String username;     // 사용자명
  private String content;      // 메시지 내용

  @CreatedDate
  private LocalDateTime createdAt;  // 메시지 발송 시간
}
