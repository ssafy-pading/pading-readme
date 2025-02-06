package site.paircoding.paircoding.util;

// JWT 생성 및 검증

import com.fasterxml.jackson.databind.ObjectMapper;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.Header;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.security.Key;
import java.util.Date;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;
import site.paircoding.paircoding.config.oauth.CustomOAuth2UserService;
import site.paircoding.paircoding.config.oauth.CustomUserDetails;
import site.paircoding.paircoding.entity.User;
import site.paircoding.paircoding.global.ApiResponse;
import site.paircoding.paircoding.global.error.ErrorCode;

@Component
@RequiredArgsConstructor
public class JwtUtil {

  private enum TokenType {
    ACCESS, REFRESH
  }

  @Value("${jwt.token.secret-key}")
  private String SECRET_KEY;

  @Value("${jwt.token.access-expire-time}")
  private long ACCESS_TOKEN_EXPIRE_TIME;

  @Value("${jwt.token.refresh-expire-time}")
  private long REFRESH_TOKEN_EXPIRE_TIME;

  private final RedisUtil redisUtil;
  private final CustomOAuth2UserService customOAuth2UserService;

  /**
   * 주어진 인증 정보를 사용하여 액세스 토큰을 생성합니다.
   *
   * @param authentication 인증 정보
   * @return 생성된 액세스 토큰
   */
  public String createAccessToken(Authentication authentication) {
    return createToken(authentication, TokenType.ACCESS, ACCESS_TOKEN_EXPIRE_TIME);
  }

  /**
   * 주어진 인증 정보를 사용하여 리프레시 토큰을 생성합니다.
   *
   * @param authentication 인증 정보
   * @return 생성된 리프레시 토큰
   */
  public String createRefreshToken(Authentication authentication) {
    return createToken(authentication, TokenType.REFRESH, REFRESH_TOKEN_EXPIRE_TIME);
  }

  /**
   * 주어진 인증 정보와 토큰 유형, 만료 시간을 사용하여 JWT 토큰을 생성합니다.
   *
   * @param authentication 인증 정보
   * @param tokenType      토큰 유형 (액세스 또는 리프레시)
   * @param expireTime     만료 시간
   * @return 생성된 JWT 토큰
   */
  private String createToken(Authentication authentication, TokenType tokenType, long expireTime) {
    User user = ((CustomUserDetails) authentication.getPrincipal()).getUser();
    return Jwts.builder()
        .setHeaderParam(Header.TYPE, Header.JWT_TYPE)
        .setSubject(String.valueOf(user.getId()))
        .claim("name", user.getName())
        .claim("token_type", tokenType)
        .setIssuedAt(new Date())
        .setExpiration(new Date(System.currentTimeMillis() + expireTime))
        .signWith(getSigningKey())
        .compact();
  }

  /**
   * 서명 키를 반환합니다.
   *
   * @return 서명 키
   */
  private Key getSigningKey() {
    byte[] keyBytes = SECRET_KEY.getBytes();
    return Keys.hmacShaKeyFor(keyBytes);
  }

  /**
   * 주어진 토큰이 유효한지 검증합니다.
   *
   * @param token 검증할 토큰
   * @return 토큰이 유효하면 true, 그렇지 않으면 false
   */
  public boolean validateToken(String token, HttpServletResponse response) {
    if (token == null) {
      return false;
    }

    try {
      return Jwts.parserBuilder()
          .setSigningKey(getSigningKey())
          .build()
          .parseClaimsJws(token)
          .getBody()
          .getExpiration()
          .after(new Date());
    } catch (ExpiredJwtException e) {
      jwtExceptionHandler(response, ErrorCode.EXPIRED_TOKEN);
      return false;
    } catch (Exception e) {
      jwtExceptionHandler(response, ErrorCode.INVALID_TOKEN);
      return false;
    }
  }

  public void jwtExceptionHandler(HttpServletResponse response, ErrorCode errorCode) {
    response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
    response.setContentType(MediaType.APPLICATION_JSON_VALUE);
    response.setCharacterEncoding("UTF-8");
    try {
      String json = new ObjectMapper().writeValueAsString(
          ApiResponse.error(errorCode.getCode(), errorCode.getMessage()));
      response.getWriter().write(json);
    } catch (IOException e) {
      e.printStackTrace();
    }
  }

  /**
   * 주어진 토큰에서 클레임을 파싱합니다.
   *
   * @param token 파싱할 토큰
   * @return 파싱된 클레임
   */
  private Claims parseClaims(String token) {
    return Jwts.parserBuilder()
        .setSigningKey(getSigningKey())
        .build()
        .parseClaimsJws(token)
        .getBody();
  }

  /**
   * 주어진 토큰에서 사용자 ID를 반환합니다.
   *
   * @param token 토큰
   * @return 사용자 ID
   */
  public Integer getId(String token) {
    return Integer.parseInt(parseClaims(token).getSubject());
  }

  /**
   * 주어진 사용자 ID와 리프레시 토큰을 Redis에 저장합니다.
   *
   * @param userId       사용자 ID
   * @param refreshToken 리프레시 토큰
   */
  public void saveRefreshToken(String userId, String refreshToken) {
    redisUtil.setex("refreshToken:" + userId, refreshToken, REFRESH_TOKEN_EXPIRE_TIME);
  }

  /**
   * 주어진 사용자 ID에 해당하는 리프레시 토큰을 Redis에서 가져옵니다.
   *
   * @param userId 사용자 ID
   * @return 리프레시 토큰
   */
  public String getRefreshToken(String userId) {
    return (String) redisUtil.get("refreshToken:" + userId);
  }

  /**
   * 주어진 사용자 ID에 해당하는 리프레시 토큰을 Redis에서 삭제합니다.
   *
   * @param userId 사용자 ID
   */
  public void deleteRefreshToken(String userId) {
    redisUtil.delete("refreshToken:" + userId);
  }
}