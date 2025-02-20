package site.paircoding.paircoding.controller;

import io.fabric8.kubernetes.client.KubernetesClientException;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageExceptionHandler;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import site.paircoding.paircoding.entity.dto.DirectoryContentDto;
import site.paircoding.paircoding.entity.dto.DirectoryCreateDto;
import site.paircoding.paircoding.entity.dto.DirectoryDeleteDto;
import site.paircoding.paircoding.entity.dto.DirectoryExceptionDto;
import site.paircoding.paircoding.entity.dto.DirectoryListDto;
import site.paircoding.paircoding.entity.dto.DirectoryRenameDto;
import site.paircoding.paircoding.entity.dto.DirectorySaveDto;
import site.paircoding.paircoding.global.exception.WebsocketException;
import site.paircoding.paircoding.service.DirectoryService;

@Controller
@RequiredArgsConstructor
public class DirectoryController {

  private final DirectoryService directoryService;
  private final SimpMessagingTemplate messagingTemplate;

  @MessageMapping("/groups/{groupId}/projects/{projectId}/users/{userId}/directory/list")
  public void get(@DestinationVariable("groupId") Integer groupId,
      @DestinationVariable("projectId") Integer projectId,
      @DestinationVariable("userId") Integer userId, DirectoryListDto dto) {
    messagingTemplate.convertAndSend(
        "/sub/groups/" + groupId + "/projects/" + projectId + "/users/" + userId + "/directory",
        directoryService.get(groupId, projectId, dto));
  }

  @MessageMapping("/groups/{groupId}/projects/{projectId}/users/{userId}/directory/create")
  @SendTo("/sub/groups/{groupId}/projects/{projectId}/users/all/directory")
  public DirectoryCreateDto create(@DestinationVariable("groupId") Integer groupId,
      @DestinationVariable("projectId") Integer projectId,
      @DestinationVariable("userId") Integer userId, DirectoryCreateDto dto) {
    return directoryService.create(groupId, projectId, dto);
  }

  @MessageMapping("/groups/{groupId}/projects/{projectId}/users/{userId}/directory/delete")
  @SendTo("/sub/groups/{groupId}/projects/{projectId}/users/all/directory")
  public DirectoryDeleteDto delete(@DestinationVariable("groupId") Integer groupId,
      @DestinationVariable("projectId") Integer projectId,
      @DestinationVariable("userId") Integer userId, DirectoryDeleteDto dto) {
    return directoryService.delete(groupId, projectId, dto);
  }

  @MessageMapping("/groups/{groupId}/projects/{projectId}/users/{userId}/directory/rename")
  @SendTo("/sub/groups/{groupId}/projects/{projectId}/users/all/directory")
  public DirectoryRenameDto rename(@DestinationVariable("groupId") Integer groupId,
      @DestinationVariable("projectId") Integer projectId,
      @DestinationVariable("userId") Integer userId, DirectoryRenameDto dto) {
    return directoryService.rename(groupId, projectId, dto);
  }

  @MessageMapping("/groups/{groupId}/projects/{projectId}/users/{userId}/directory/content")
  public void content(@DestinationVariable("groupId") Integer groupId,
      @DestinationVariable("projectId") Integer projectId,
      @DestinationVariable("userId") Integer userId, DirectoryContentDto dto) {
    messagingTemplate.convertAndSend(
        "/sub/groups/" + groupId + "/projects/" + projectId + "/users/" + userId + "/directory",
        directoryService.content(groupId, projectId, dto));
  }

  @MessageMapping("/groups/{groupId}/projects/{projectId}/users/{userId}/directory/save")
  @SendTo("/sub/groups/{groupId}/projects/{projectId}/users/all/directory")
  public DirectorySaveDto save(@DestinationVariable("groupId") Integer groupId,
      @DestinationVariable("projectId") Integer projectId, DirectorySaveDto dto) {
    return directoryService.save(groupId, projectId, dto);
  }

  @MessageExceptionHandler(WebsocketException.class)
  @SendTo("/sub/groups/{groupId}/projects/{projectId}/directory")
  public DirectoryExceptionDto handleWebsocketException(Exception e) {
    return new DirectoryExceptionDto("File system error: " + e.getMessage());
  }

  @MessageExceptionHandler(KubernetesClientException.class)
  @SendTo("/sub/groups/{groupId}/projects/{projectId}/directory")
  public DirectoryExceptionDto handleKubernetesClientException(Exception e) {
//    e.printStackTrace();
    return new DirectoryExceptionDto("Internal Server Error");
  }

  @MessageExceptionHandler(Exception.class)
  @SendTo("/sub/groups/{groupId}/projects/{projectId}/directory")
  public DirectoryExceptionDto handleException(Exception e) {
    e.printStackTrace();
    return new DirectoryExceptionDto("Internal Server Error");
  }
}