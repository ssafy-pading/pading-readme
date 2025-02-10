package site.paircoding.paircoding.controller;

import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import site.paircoding.paircoding.entity.ChatDocument;
import site.paircoding.paircoding.service.ChatService;

@RestController
@RequiredArgsConstructor
@RequestMapping("/v1/chat")
public class ChatController {

  private final ChatService chatService;

  //@GroupRoleCheck(Role.MEMBER)
  @GetMapping("/groups/{groupId}/projects/{projectId}")
  public List<ChatDocument> getChatMessages(@PathVariable("groupId") Integer groupId,
      @PathVariable("projectId") Integer projectId) {
    return chatService.getMessages(projectId);
  }
}
