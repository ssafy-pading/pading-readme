package site.paircoding.paircoding.config.oauth;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.net.URI;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.util.UriComponentsBuilder;
import site.paircoding.paircoding.util.JwtUtil;

@Component
@RequiredArgsConstructor
public class OAuth2MemberSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

  private final JwtUtil jwtUtil;

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
    MultiValueMap<String, String> queryParams = new LinkedMultiValueMap<>();

    // 액세스 토큰과 리프레시 토큰을 생성합니다.
    String accessToken = jwtUtil.createAccessToken(authentication);
    String refreshToken = jwtUtil.createRefreshToken(authentication);
    jwtUtil.saveRefreshToken(authentication.getName(), refreshToken);

    // 쿼리 파라미터에 토큰을 추가합니다.
    queryParams.add("accessToken", accessToken);
    queryParams.add("refreshToken", refreshToken);

    // JSON 형식으로 응답을 설정합니다.
//    response.setContentType("application/json");
//    response.getWriter().write("{\"accessToken\":\"" + accessToken + "\",\"refreshToken\":\"" + refreshToken + "\"}");

    // 리다이렉트 전략을 사용하여 리다이렉트할 수 있습니다. (주석 처리됨)
    URI uri = UriComponentsBuilder
        .fromUriString("https://pading.site")
        .queryParams(queryParams)
        .build()
        .toUri();
    getRedirectStrategy().sendRedirect(request, response, uri.toString());
  }
}