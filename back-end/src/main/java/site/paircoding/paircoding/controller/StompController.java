package site.paircoding.paircoding.controller;

import lombok.RequiredArgsConstructor;
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
    System.out.println(e.getMessage());
  }
}
