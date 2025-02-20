package site.paircoding.paircoding.controller;

import java.util.HashMap;
import java.util.Map;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.web.bind.annotation.RestController;
import site.paircoding.paircoding.util.RedisUtil;

@RestController
public class ProjectStatusController {

  private final RedisUtil redisUtil;

  public ProjectStatusController(RedisUtil redisUtil) {
    this.redisUtil = redisUtil;
  }

  @MessageMapping("/project-status/groups/{groupId}/projects/{projectId}")
  @SendTo("/sub/project-status/groups/{groupId}")
  public Map<String, Object> sendNotification(@DestinationVariable Integer groupId,
      @DestinationVariable Integer projectId,
      @Payload Map<String, Object> payload) {

    String status = (String) payload.get("status");
    // 전송할 알림 데이터 생성
    Map<String, Object> notificationData = new HashMap<>();
    notificationData.put("projectId", projectId);
    notificationData.put("status", status);
    if (status.equals("active")) {
      redisUtil.set("callStatusProjectId:" + projectId, "active");
    } else if (status.equals("inactive")) {
      redisUtil.set("callStatusProjectId:" + projectId, "inactive");
    }
    return notificationData;  // 이 값을 @SendTo에 설정된 경로로 자동 전송
  }

}
