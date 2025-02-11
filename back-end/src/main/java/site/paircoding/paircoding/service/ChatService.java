package site.paircoding.paircoding.service;

import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import site.paircoding.paircoding.entity.ChatDocument;
import site.paircoding.paircoding.repository.ChatRepository;

@Service
@RequiredArgsConstructor
public class ChatService {

  private final ChatRepository chatRepository;

  // 메시지 저장
  public ChatDocument saveMessage(Integer userId, Integer projectId, String username,
      String content) {

    return chatRepository.save(ChatDocument.builder()
        .userId(userId)
        .projectId(projectId)
        .username(username)
        .content(content)
        .build());
  }

  // 특정 채팅방의 메시지 목록 조회
  public List<ChatDocument> getMessages(Integer projectId) {
    return chatRepository.findByProjectIdOrderByCreatedAtAsc(projectId);
  }
}
