package site.paircoding.paircoding.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;
import site.paircoding.paircoding.entity.dto.DirectoryCreateDto;
import site.paircoding.paircoding.entity.dto.DirectoryDeleteDto;
import site.paircoding.paircoding.entity.dto.DirectoryListDto;
import site.paircoding.paircoding.entity.dto.DirectoryRenameDto;
import site.paircoding.paircoding.service.DirectoryService;

@Controller
@RequiredArgsConstructor
public class DirectoryController {

  private final DirectoryService directoryService;

  @MessageMapping("/groups/{groupId}/projects/{projectId}/directory/list")
  @SendTo("/sub/groups/{groupId}/projects/{projectId}/directory")
  public DirectoryListDto get(@DestinationVariable("groupId") Integer groupId,
      @DestinationVariable("projectId") Integer projectId, DirectoryListDto dto) {
    return directoryService.get(groupId, projectId, dto);
  }

  @MessageMapping("/groups/{groupId}/projects/{projectId}/directory/create")
  @SendTo("/sub/groups/{groupId}/projects/{projectId}/directory")
  public DirectoryCreateDto create(@DestinationVariable("groupId") Integer groupId,
      @DestinationVariable("projectId") Integer projectId, DirectoryCreateDto dto) {
    return directoryService.create(groupId, projectId, dto);
  }

  @MessageMapping("/groups/{groupId}/projects/{projectId}/directory/delete")
  @SendTo("/sub/groups/{groupId}/projects/{projectId}/directory")
  public DirectoryDeleteDto delete(@DestinationVariable("groupId") Integer groupId,
      @DestinationVariable("projectId") Integer projectId, DirectoryDeleteDto dto) {
    return directoryService.delete(groupId, projectId, dto);
  }

  @MessageMapping("/groups/{groupId}/projects/{projectId}/directory/rename")
  @SendTo("/sub/groups/{groupId}/projects/{projectId}/directory")
  public DirectoryRenameDto rename(@DestinationVariable("groupId") Integer groupId,
      @DestinationVariable("projectId") Integer projectId, DirectoryRenameDto dto) {
    return directoryService.rename(groupId, projectId, dto);
  }

}