package site.paircoding.paircoding.service;

import java.util.Map;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
import site.paircoding.paircoding.config.oauth.CustomUserDetails;
import site.paircoding.paircoding.entity.User;
import site.paircoding.paircoding.entity.dto.AuthResponse;
import site.paircoding.paircoding.global.exception.UnauthorizedException;
import site.paircoding.paircoding.repository.UserRepository;
import site.paircoding.paircoding.util.JwtUtil;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {
  private final JwtUtil jwtUtil;
  private final UserRepository userRepository;

  public AuthResponse refresh(String refreshToken) {
    log.info("refreshToken: {}", refreshToken);
    if (refreshToken == null || !refreshToken.startsWith("Bearer ")) {
      throw new UnauthorizedException("Invalid refresh token");
    }

    String token = refreshToken.substring(7);

    if (!jwtUtil.validateToken(token, null)) {
      throw new UnauthorizedException("Invalid refresh token");
    }

    User user = userRepository.findById(jwtUtil.getId(token)).orElseThrow(() -> new UnauthorizedException("Invalid refresh token"));

    if (!jwtUtil.getRefreshToken(user.getId().toString()).equals(token)) {
      throw new UnauthorizedException("Invalid refresh token");
    }

    OAuth2User oAuth2User = new CustomUserDetails(user);
    Authentication authentication = new UsernamePasswordAuthenticationToken(oAuth2User, "", oAuth2User.getAuthorities());
    String newAccessToken = jwtUtil.createAccessToken(authentication);
    String newRefreshToken = jwtUtil.createRefreshToken(authentication);
    jwtUtil.saveRefreshToken(authentication.getName(), newRefreshToken);
    return AuthResponse.builder().accessToken(newAccessToken).refreshToken(newRefreshToken).build();
  }

}
