package site.paircoding.paircoding.config.oauth;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import site.paircoding.paircoding.util.CookieUtil;
import site.paircoding.paircoding.util.JwtUtil;

@Component
@RequiredArgsConstructor
public class OAuth2MemberSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

  private final JwtUtil jwtUtil;
  private final CookieUtil cookieUtil;

  /**
   * 인증 성공 시 호출되는 메서드입니다.
   *
   * @param request        HttpServletRequest 객체
   * @param response       HttpServletResponse 객체
   * @param authentication 인증 정보
   * @throws IOException 입출력 예외
   */
  public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
      Authentication authentication) throws IOException {

    // 액세스 토큰과 리프레시 토큰을 생성합니다.
    String accessToken = jwtUtil.createAccessToken(authentication);
    String refreshToken = jwtUtil.createRefreshToken(authentication);
    jwtUtil.saveRefreshToken(authentication.getName(), refreshToken);

    cookieUtil.addRefreshTokenCookie(response, refreshToken);
    cookieUtil.addAccessTokenCookie(response, accessToken);

    response.sendRedirect("http://localhost:8080");
  }
}