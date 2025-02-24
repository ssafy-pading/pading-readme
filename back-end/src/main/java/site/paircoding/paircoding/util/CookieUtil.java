package site.paircoding.paircoding.util;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.util.Arrays;
import java.util.Optional;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseCookie;
import org.springframework.stereotype.Component;

@Component
public class CookieUtil {

  @Value("${jwt.token.access-expire-time}")
  private long ACCESS_TOKEN_EXPIRE_TIME;

  @Value("${jwt.token.refresh-expire-time}")
  private long REFRESH_TOKEN_EXPIRE_TIME;


  public void addCookie(HttpServletResponse response, String name, String value,
      long maxAge) {
    ResponseCookie cookie = ResponseCookie.from(name, value)
        .httpOnly(true)
        .secure(false)
        .path("/")
        .maxAge(maxAge)
        .build();

    response.addHeader("Set-Cookie", cookie.toString());
  }


  /**
   * Access Token 쿠키 생성
   */
  public void addAccessTokenCookie(HttpServletResponse response, String token) {
    addCookie(response, "access_token", token, ACCESS_TOKEN_EXPIRE_TIME);
  }


  /**
   * Refresh Token 쿠키 생성
   */
  public void addRefreshTokenCookie(HttpServletResponse response, String token) {
    addCookie(response, "refresh_token", token, REFRESH_TOKEN_EXPIRE_TIME);
  }

  /**
   * 쿠키 삭제
   */
  public void removeCookie(HttpServletResponse response, String name) {
    addCookie(response, name, null, 0);
  }


  /**
   * 헤더에서 액세스 토큰 추출
   */
  public Optional<String> getAccessToken(HttpServletRequest request) {
    if (request.getCookies() == null) {
      return Optional.empty();
    }
    return Arrays.stream(request.getCookies())
        .filter(cookie -> "access_token".equals(cookie.getName()))
        .map(Cookie::getValue)
        .findFirst();
  }


  /***
   * 쿠키에서 리프레시 토큰 추출
   */
  public Optional<String> getRefreshToken(HttpServletRequest request) {
    if (request.getCookies() == null) {
      return Optional.empty();
    }
    return Arrays.stream(request.getCookies())
        .filter(cookie -> "refresh_token".equals(cookie.getName()))
        .map(Cookie::getValue)
        .findFirst();
  }
}
