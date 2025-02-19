package site.paircoding.paircoding.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Controller;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.util.UriComponentsBuilder;
import site.paircoding.paircoding.config.AppConfig;
import site.paircoding.paircoding.config.oauth.CustomUserDetails;
import site.paircoding.paircoding.entity.User;
import site.paircoding.paircoding.repository.UserRepository;
import site.paircoding.paircoding.util.JwtUtil;


@Controller
@RequiredArgsConstructor
@RequestMapping("/v1/test")
public class TestController {

  private final JwtUtil jwtUtil;
  private final AppConfig appConfig;
  private final UserRepository userRepository;

  @GetMapping()
  public String test() {
    User user = userRepository.findByEmail("test@pair-coding.site").orElseThrow();

    OAuth2User oAuth2User = new CustomUserDetails(user);
    Authentication authentication = new UsernamePasswordAuthenticationToken(oAuth2User, "",
        oAuth2User.getAuthorities());
    String accessToken = jwtUtil.createAccessToken(authentication);
    String refreshToken = jwtUtil.createRefreshToken(authentication);

    // 쿼리 파라미터에 토큰을 추가합니다.
    MultiValueMap<String, String> queryParams = new LinkedMultiValueMap<>();
    queryParams.add("accessToken", accessToken);
    queryParams.add("refreshToken", refreshToken);

    // 리다이렉트 전략을 사용하여 리다이렉트할 수 있습니다. (주석 처리됨)
    String uri = UriComponentsBuilder
        .fromUriString(appConfig.getLOGIN_REDIRECT_DOMAIN())
        .queryParams(queryParams)
        .build()
        .toUriString();

    return "redirect:" + uri;
  }
}
