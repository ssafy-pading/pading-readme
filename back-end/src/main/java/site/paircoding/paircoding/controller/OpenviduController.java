package site.paircoding.paircoding.controller;

import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import site.paircoding.paircoding.annotaion.GroupRoleCheck;
import site.paircoding.paircoding.config.oauth.CustomUserDetails;
import site.paircoding.paircoding.entity.enums.Role;
import site.paircoding.paircoding.service.OpenviduService;

@RestController
@RequiredArgsConstructor
@RequestMapping("/v1/openvidu")
public class OpenviduController {

  private final OpenviduService openviduService;

  @GroupRoleCheck(Role.MEMBER)
  @PostMapping(value = "/token/groups/{groupId}/projects/{projectId}")
  public ResponseEntity<Map<String, String>> createToken(
      @AuthenticationPrincipal CustomUserDetails customUserDetails,
      @PathVariable String groupId, @PathVariable String projectId) {
    return ResponseEntity.ok(openviduService.createToken(customUserDetails.getUser(), projectId));
  }

  @PostMapping(value = "/livekit/webhook", consumes = "application/webhook+json")
  public ResponseEntity<String> receiveWebhook(@RequestHeader("Authorization") String authHeader,
      @RequestBody String body) {
    return ResponseEntity.ok(openviduService.handleWebhook(authHeader, body));
  }
}