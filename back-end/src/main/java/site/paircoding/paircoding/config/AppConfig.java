package site.paircoding.paircoding.config;

import lombok.Getter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

@Configuration
public class AppConfig {

  @Getter
  @Value("${app.domain}")
  private String domain;

  @Getter
  @Value("${app.login-redirect-domain}")
  private String LOGIN_REDIRECT_DOMAIN;

}
