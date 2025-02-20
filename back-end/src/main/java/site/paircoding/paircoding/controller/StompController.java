package site.paircoding.paircoding.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageExceptionHandler;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.web.bind.annotation.RestController;
import site.paircoding.paircoding.entity.ChatDocument;
import site.paircoding.paircoding.entity.dto.ChatDto;
import site.paircoding.paircoding.service.ChatService;

@RestController
@RequiredArgsConstructor
@Slf4j  // Lombok을 활용한 Logger 선언
public class StompController {

  private final ChatService chatService;

  @MessageMapping("/chat/{projectId}")
  @SendTo("/sub/chat/{projectId}")
  public ChatDto sendMessage(ChatDto request,
      @DestinationVariable("projectId") Integer projectId) {
    // 메시지를 MongoDB에 저장
    ChatDocument chatDocument = chatService.saveMessage(request.getUserId(), projectId,
        request.getUsername(), request.getContent());
    return new ChatDto(request.getUserId(), request.getUsername(), request.getContent(),
        chatDocument.getCreatedAt());
  }

  @MessageExceptionHandler
  public void handleException(RuntimeException e) {
    log.error("WebSocket 메시지 처리 중 오류 발생: {}", e.getMessage(), e);
  }
}
