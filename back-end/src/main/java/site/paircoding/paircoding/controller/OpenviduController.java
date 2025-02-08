package site.paircoding.paircoding.controller;

import io.livekit.server.AccessToken;
import io.livekit.server.RoomJoin;
import io.livekit.server.RoomName;
import io.livekit.server.WebhookReceiver;
import java.util.Map;
import livekit.LivekitWebhook.WebhookEvent;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import site.paircoding.paircoding.config.oauth.CustomUserDetails;
import site.paircoding.paircoding.entity.User;

@RestController
@RequiredArgsConstructor
@RequestMapping("/v1/openvidu")
public class OpenviduController {

  @Value("${livekit.api.key}")
  private String LIVEKIT_API_KEY;

  @Value("${livekit.api.secret}")
  private String LIVEKIT_API_SECRET;

  @PostMapping(value = "/token/{projectId}")
  public ResponseEntity<Map<String, String>> createToken(
      @AuthenticationPrincipal CustomUserDetails customUserDetails,
      @PathVariable String projectId) {
    AccessToken token = new AccessToken(LIVEKIT_API_KEY, LIVEKIT_API_SECRET);
    User user = customUserDetails.getUser();
    token.setName(user.getName());
    token.setIdentity(user.getId() + "");
    token.addGrants(new RoomJoin(true), new RoomName(projectId));
    System.out.println("token: " + token.toJwt());
    return ResponseEntity.ok(Map.of("token", token.toJwt()));
  }

  @PostMapping(value = "/livekit/webhook", consumes = "application/webhook+json")
  public ResponseEntity<String> receiveWebhook(@RequestHeader("Authorization") String authHeader,
      @RequestBody String body) {
    WebhookReceiver webhookReceiver = new WebhookReceiver(LIVEKIT_API_KEY, LIVEKIT_API_SECRET);
    try {
      WebhookEvent event = webhookReceiver.receive(body, authHeader);
      System.out.println("LiveKit Webhook: " + event.toString());
    } catch (Exception e) {
      System.err.println("Error validating webhook event: " + e.getMessage());
    }
    return ResponseEntity.ok("ok");
  }

}

