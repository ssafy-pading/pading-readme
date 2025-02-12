package site.paircoding.paircoding.service;

import io.livekit.server.AccessToken;
import io.livekit.server.RoomJoin;
import io.livekit.server.RoomName;
import io.livekit.server.WebhookReceiver;
import java.util.Map;
import livekit.LivekitWebhook.WebhookEvent;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import site.paircoding.paircoding.entity.User;

@Service
@RequiredArgsConstructor
public class OpenviduService {

  @Value("${livekit.api.key}")
  private String LIVEKIT_API_KEY;

  @Value("${livekit.api.secret}")
  private String LIVEKIT_API_SECRET;

  public Map<String, String> createToken(User user, String projectId) {
    AccessToken token = new AccessToken(LIVEKIT_API_KEY, LIVEKIT_API_SECRET);
    token.setName(user.getName());
    token.setIdentity(user.getId() + "");
    token.addGrants(new RoomJoin(true), new RoomName(projectId));
    return Map.of("token", token.toJwt());
  }

  public String handleWebhook(String authHeader, String body) {
    WebhookReceiver webhookReceiver = new WebhookReceiver(LIVEKIT_API_KEY, LIVEKIT_API_SECRET);
    try {
      WebhookEvent event = webhookReceiver.receive(body, authHeader);
      System.out.println("LiveKit Webhook: " + event.toString());
    } catch (Exception e) {
      System.out.println("Error validating webhook event: " + e.getMessage());
    }
    return "ok";
  }
}