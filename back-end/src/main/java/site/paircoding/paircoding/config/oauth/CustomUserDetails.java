package site.paircoding.paircoding.config.oauth;

import java.util.ArrayList;
import java.util.Collection;
import java.util.Map;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.ToString;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.oauth2.core.user.OAuth2User;
import site.paircoding.paircoding.entity.User;

@Getter
@ToString
@RequiredArgsConstructor
public class CustomUserDetails implements OAuth2User {

  private final User user;
  private final Map<String, Object> attributes;

  /**
   * 사용자 객체를 사용하여 CustomUserDetails를 생성합니다.
   *
   * @param user 사용자 객체
   */
  public CustomUserDetails(User user) {
    this.user = user;
    attributes = Map.of();
  }

  /**
   * OAuth2 사용자 속성을 반환합니다.
   *
   * @return 사용자 속성 맵
   */
  @Override
  public Map<String, Object> getAttributes() {
    return attributes;
  }

  /**
   * 사용자 권한을 반환합니다.
   *
   * @return 사용자 권한 컬렉션
   */
  @Override
  public Collection<? extends GrantedAuthority> getAuthorities() {
    Collection<GrantedAuthority> authorities = new ArrayList<>();
    return authorities;
  }

  /**
   * 사용자의 이름(고유 ID)을 반환합니다.
   *
   * @return 사용자 ID 문자열
   */
  @Override
  public String getName() {
    return user.getId().toString();
  }
}