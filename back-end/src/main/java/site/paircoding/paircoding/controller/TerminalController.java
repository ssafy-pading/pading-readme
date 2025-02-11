package site.paircoding.paircoding.controller;

import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.stereotype.Controller;
import site.paircoding.paircoding.service.TerminalService;

@Controller
@RequiredArgsConstructor
public class TerminalController {

  private final TerminalService terminalService;

  @MessageMapping("/groups/{groupId}/projects/{projectId}/terminal/{terminalId}/connect")
  public void connectToPod(@DestinationVariable("groupId") Integer groupId,
      @DestinationVariable("projectId") Integer projectId,
      @DestinationVariable("terminalId") String terminalId) throws Exception {

    // todo 유저의 그룹 권한 확인 - 멤버 권한일 경우 프로젝트 유저에 포함되어있는지 확인

    String destination =
        "/sub/groups/" + groupId + "/projects/" + projectId + "/terminal/" + terminalId;
    terminalService.connectToPod(groupId, projectId, terminalId, destination);
  }

  @MessageMapping("/groups/{groupId}/projects/{projectId}/terminal/{terminalId}/input")
  public void handleInput(@DestinationVariable("terminalId") String terminalId, String input) {
    terminalService.handleInput(terminalId, input);
  }

  @MessageMapping("/groups/{groupId}/projects/{projectId}/terminal/{terminalId}/resize")
  public void handleResize(@DestinationVariable("terminalId") String terminalId, Map<?, ?> resize) {
    terminalService.handleResize(terminalId, resize);
  }
}
