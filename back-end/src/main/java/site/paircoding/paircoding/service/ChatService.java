package site.paircoding.paircoding.service;

import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import site.paircoding.paircoding.entity.ChatDocument;
import site.paircoding.paircoding.global.exception.BadRequestException;
import site.paircoding.paircoding.repository.ChatRepository;
import site.paircoding.paircoding.repository.ProjectRepository;

@Service
@RequiredArgsConstructor
public class ChatService {

  private final ChatRepository chatRepository;
  private final ProjectRepository projectRepository;

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
  public List<ChatDocument> getMessages(Integer groupId, Integer projectId) {
    if (projectRepository.findByGroupIdAndProjectId(groupId, projectId).isEmpty()) {
      throw new BadRequestException("그룹에 존재하는 프로젝트가 아닙니다");
    }
    return chatRepository.findByProjectIdOrderByCreatedAtAsc(projectId);
  }
}
