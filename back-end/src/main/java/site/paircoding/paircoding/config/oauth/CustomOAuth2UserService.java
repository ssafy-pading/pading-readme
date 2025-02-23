package site.paircoding.paircoding.config.oauth;

import java.util.Map;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
import site.paircoding.paircoding.entity.User;
import site.paircoding.paircoding.repository.UserRepository;

@Service
@RequiredArgsConstructor
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

  private final UserRepository userRepository;

  /**
   * OAuth2UserRequest를 사용하여 사용자 정보를 로드합니다.
   *
   * @param userRequest OAuth2UserRequest
   * @return OAuth2User
   */
  @Override
  public OAuth2User loadUser(OAuth2UserRequest userRequest) {
    OAuth2User oAuth2User = super.loadUser(userRequest);
    String provider = userRequest.getClientRegistration().getRegistrationId();
    User user = socialLogin(provider, oAuth2User);

    return new CustomUserDetails(user, null);
  }

  /**
   * 주어진 제공자 정보로 사용자를 조회하거나 저장합니다.
   *
   * @param provider   제공자
   * @param providerId 제공자 ID
   * @param email      이메일
   * @param name       이름
   * @return User
   */
  public User getOrSave(String provider, String providerId, String email, String name) {
    Optional<User> user = userRepository.findByProviderAndProviderId(provider, providerId);

    if (user.isEmpty()) {
      User newUser = User.builder()
          .provider(provider)
          .providerId(providerId)
          .name(name)
          .email(email)
          .build();

      return userRepository.save(newUser);
    }
    return user.get();
  }

  private User socialLogin(String provider, OAuth2User oAuth2User) {
    switch (provider) {
      case "google":
        return google(provider, oAuth2User);
      case "kakao":
        return kakao(provider, oAuth2User);
      case "naver":
        return naver(provider, oAuth2User);
      default:
        throw new RuntimeException("Unsupported provider: " + provider);
    }
  }

  private User google(String provider, OAuth2User oAuth2User) {
    String providerId = oAuth2User.getName();

    Map<String, Object> attributes = oAuth2User.getAttributes();
    String email = (String) attributes.get("email");
    String name = (String) attributes.get("name");

    return getOrSave(provider, providerId, email, name);
  }

  private User kakao(String provider, OAuth2User oAuth2User) {
    String providerId = oAuth2User.getName();

    Map<String, Object> kakaoAccount = oAuth2User.getAttribute("kakao_account");
    Map<String, Object> profile = (Map<String, Object>) kakaoAccount.get("profile");
    String email = (String) kakaoAccount.get("email");
    String name = (String) profile.get("nickname");

    return getOrSave(provider, providerId, email, name);
  }

  private User naver(String provider, OAuth2User oAuth2User) {
    Map<String, Object> attributes = oAuth2User.getAttributes();
    String providerId = (String) ((Map) attributes.get("response")).get("id");
    String email = (String) ((Map) attributes.get("response")).get("email");
    String name = (String) ((Map) attributes.get("response")).get("name");

    return getOrSave(provider, providerId, email, name);
  }
}










