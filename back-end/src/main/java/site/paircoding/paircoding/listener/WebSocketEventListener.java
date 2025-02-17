package site.paircoding.paircoding.listener;

import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionConnectEvent;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;
import org.springframework.web.socket.messaging.SessionSubscribeEvent;
import site.paircoding.paircoding.util.RedisUtil;

@Slf4j
@Component
@RequiredArgsConstructor
public class WebSocketEventListener {

  private static final String STATUS_PREFIX = "statusId=%d";
  private static final String PROJECT_USER_KEY = "project:%s:user:%s"; // Redis 저장 키 형식

  private final RedisUtil redisUtil;
  private final SimpMessagingTemplate messagingTemplate;
  private final ObjectMapper objectMapper = new ObjectMapper(); // ✅ JSON 변환을 위한 ObjectMapper

  // 세션 ID와 유저 ID, 그룹 ID, 프로젝트 ID를 매핑하여 저장하는 Map
  private final Map<String, String> userSessionMap = new ConcurrentHashMap<>();
  private final Map<String, String> sessionGroupMap = new ConcurrentHashMap<>();
  private final Map<String, String> sessionProjectMap = new ConcurrentHashMap<>(); // ✅ 프로젝트 ID 저장

  @EventListener
  public void handleWebSocketConnectListener(SessionConnectEvent event) {
    StompHeaderAccessor headerAccessor = StompHeaderAccessor.wrap(event.getMessage());
    String sessionId = headerAccessor.getSessionId();
    String userId = headerAccessor.getFirstNativeHeader("userId");
    String groupId = headerAccessor.getFirstNativeHeader("groupId");
    log.info("WebSocket Connected: sessionId={}, userId={}, groupId={}", sessionId, userId,
        groupId);

    if (userId != null && groupId != null) {
      redisUtil.set(STATUS_PREFIX.formatted(Integer.parseInt(userId)), "online");
      userSessionMap.put(sessionId, userId);
      sessionGroupMap.put(sessionId, groupId);

      // ✅ JSON 메시지 생성
      Map<String, String> message = new HashMap<>();
      message.put("status", "online");
      message.put("userId", userId);

      try {
        String jsonMessage = objectMapper.writeValueAsString(message);
        messagingTemplate.convertAndSend("/sub/status/groups/" + groupId, jsonMessage);
      } catch (Exception e) {
        log.error("Error converting connect message to JSON", e);
      }
    }
  }

  /**
   * 사용자가 특정 프로젝트 채널을 구독할 때 실행 (예: /chat/{projectId})
   */
  @EventListener
  public void handleWebSocketSubscribeListener(SessionSubscribeEvent event) {
    StompHeaderAccessor headerAccessor = StompHeaderAccessor.wrap(event.getMessage());
    String destination = headerAccessor.getDestination(); // 구독한 경로
    String sessionId = headerAccessor.getSessionId();
    String userId = userSessionMap.get(sessionId);
    String groupId = sessionGroupMap.get(sessionId);

    // ✅ /chat/{projectId} 패턴 확인
    if (destination != null && destination.startsWith("/sub/chat/")) {
      String projectId = destination.replace("/sub/chat/", ""); // projectId 추출
      sessionProjectMap.put(sessionId, projectId); // ✅ 세션 ID와 프로젝트 ID 저장

      log.info("User Subscribed: sessionId={}, userId={}, projectId={}", sessionId, userId,
          projectId);

      // ✅ Redis에 저장하여 접속 중 상태로 표시
      String redisKey = PROJECT_USER_KEY.formatted(projectId, userId);
      redisUtil.set(redisKey, "online");

      Map<String, String> projectStatusMessage = new HashMap<>();
      projectStatusMessage.put("status", "member");
      projectStatusMessage.put("projectId", projectId);

      try {
        String jsonProejctStatusMessage = objectMapper.writeValueAsString(projectStatusMessage);
        messagingTemplate.convertAndSend("/sub/project-status/groups/" + groupId,
            jsonProejctStatusMessage);
      } catch (Exception e) {
        log.error("Error converting subscribe message to JSON", e);
      }
    }
  }

  /**
   * 사용자가 WebSocket 연결을 종료할 때 실행
   */
  @EventListener
  public void handleWebSocketDisconnectListener(SessionDisconnectEvent event) {
    StompHeaderAccessor headerAccessor = StompHeaderAccessor.wrap(event.getMessage());
    String sessionId = headerAccessor.getSessionId();
    String userId = userSessionMap.get(sessionId);
    String groupId = sessionGroupMap.get(sessionId);
    String projectId = sessionProjectMap.get(sessionId);

    log.info("WebSocket Disconnected: sessionId={}, userId={}, groupId={}, projectId={}", sessionId,
        userId, groupId, projectId);

    if (userId != null) {
      redisUtil.set(STATUS_PREFIX.formatted(Integer.parseInt(userId)), "offline");

      // ✅ 프로젝트에서 나가면 Redis에서 해당 정보 삭제
      if (projectId != null) {
        String redisKey = PROJECT_USER_KEY.formatted(projectId, userId);
        redisUtil.delete(redisKey); // Redis에서 삭제

        Map<String, String> projectStatusMessage = new HashMap<>();
        projectStatusMessage.put("status", "member");
        projectStatusMessage.put("projectId", projectId);

        try {
          String jsonProejctStatusMessage = objectMapper.writeValueAsString(projectStatusMessage);
          messagingTemplate.convertAndSend("/sub/project-status/groups/" + groupId,
              jsonProejctStatusMessage);
        } catch (Exception e) {
          log.error("Error converting disconnect message to JSON", e);
        }
      }

      // ✅ 그룹에서도 연결 해제 메시지 전송
      if (groupId != null) {
        Map<String, String> groupMessage = new HashMap<>();
        groupMessage.put("status", "disconnect");
        groupMessage.put("userId", userId);

        try {
          messagingTemplate.convertAndSend("/sub/status/groups/" + groupId,
              objectMapper.writeValueAsString(groupMessage));
        } catch (Exception e) {
          log.error("Error converting disconnect message to JSON", e);
        }
      }

      // 세션 정보 삭제
      userSessionMap.remove(sessionId);
      sessionGroupMap.remove(sessionId);
      sessionProjectMap.remove(sessionId);
    }
  }
}
