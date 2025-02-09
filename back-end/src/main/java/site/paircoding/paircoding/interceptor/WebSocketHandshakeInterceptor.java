package site.paircoding.paircoding.interceptor;

import lombok.RequiredArgsConstructor;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Component;
import site.paircoding.paircoding.config.oauth.CustomUserDetails;
import site.paircoding.paircoding.entity.User;
import site.paircoding.paircoding.global.exception.UnauthorizedException;
import site.paircoding.paircoding.repository.UserRepository;
import site.paircoding.paircoding.util.JwtUtil;

@Component
@RequiredArgsConstructor
public class WebSocketHandshakeInterceptor implements ChannelInterceptor {

  private final JwtUtil jwtUtil;
  private final UserRepository userRepository;

  @Override
  public Message<?> preSend(Message<?> message, MessageChannel channel) {

    StompHeaderAccessor accessor = StompHeaderAccessor.wrap(message);

    // 연결 요청(CONNECT) 시 토큰 검증
    if (StompCommand.CONNECT == accessor.getCommand()) { // websocket 연결요청
      String bearerToken = accessor.getFirstNativeHeader("Authorization");

      if (bearerToken != null && bearerToken.startsWith("Bearer ")) {
        String token = bearerToken.substring(7);
        User user;

        if (jwtUtil.validateToken(token, null)) {
          user = userRepository.findById(jwtUtil.getId(token))
              .orElseThrow(() -> new UnauthorizedException("Invalid token"));

          OAuth2User oAuth2User = new CustomUserDetails(user);
          Authentication authentication = new UsernamePasswordAuthenticationToken(oAuth2User, "",
              oAuth2User.getAuthorities());
          accessor.setUser(authentication);

          return message;
        }
      }

      throw new UnauthorizedException("로그인 후 이용해주세요.");
    }
    return message;
  }
}

