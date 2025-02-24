package site.paircoding.paircoding.config;

import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.CsrfConfigurer;
import org.springframework.security.config.annotation.web.configurers.HeadersConfigurer;
import org.springframework.security.config.annotation.web.configurers.HttpBasicConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import site.paircoding.paircoding.config.jwt.JwtFilter;
import site.paircoding.paircoding.config.oauth.OAuth2MemberSuccessHandler;
import site.paircoding.paircoding.util.CookieUtil;
import site.paircoding.paircoding.util.JwtUtil;

/*
 *  Spring Security 설정 클래스
 *
 */

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
@EnableMethodSecurity
public class WebSecurityConfig {

  private final JwtUtil jwtUtil;
  private final CookieUtil cookieUtil;
  private final JwtFilter jwtFilter;
  private final AppConfig appConfig;

  /**
   * SecurityFilterChain을 구성합니다.
   *
   * @param http HttpSecurity 객체
   * @return SecurityFilterChain
   * @throws Exception 예외
   */
  @Bean
  protected SecurityFilterChain configure(HttpSecurity http) throws Exception {
    http.cors(cors -> cors.configurationSource(corsConfigrationSource())) // CORS 설정
        .csrf(CsrfConfigurer::disable) // CSRF 비활성화
        .httpBasic(HttpBasicConfigurer::disable) // HTTP Basic 인증 비활성화
        .sessionManagement(
            session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)) // 세션 관리 설정
        .authorizeHttpRequests(request -> request
//            .requestMatchers("/v1/auth/**", "/oauth2/authorization/**").permitAll() // 인증없이 허용 주소
//            .anyRequest().authenticated()
                .anyRequest().permitAll()
        )
        .oauth2Login(oauth2 -> oauth2
                .successHandler(new OAuth2MemberSuccessHandler(jwtUtil, appConfig))
            // OAuth2 로그인 성공 핸들러 설정
        )
        .exceptionHandling(exception -> exception
            // 인증되지 않은 사용자 처리 (401)
            .authenticationEntryPoint((request, response, authException) -> {
              response.setStatus(HttpServletResponse.SC_UNAUTHORIZED); // 401 응답
              response.getWriter().write("Access Denied");
            })
        )
        .headers(headers -> headers
            .frameOptions(HeadersConfigurer.FrameOptionsConfig::disable) // X-Frame-Options 비활성화
            .contentSecurityPolicy(csp -> csp
                .policyDirectives(
                    "frame-ancestors 'self' https://pair-coding.site https://pading.site http://localhost:5173 http://localhost:5174 https://pading-c8f33.firebaseapp.com/;")
            )
        )
        .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class); // JWT 필터 추가

//                .exceptionHandling(exception -> exception.accessDeniedPage("/403"));

    return http.build();
  }


  @Bean
  protected CorsConfigurationSource corsConfigrationSource() {
    CorsConfiguration configuration = new CorsConfiguration();
    configuration.addAllowedOrigin("https://pading.site");
    configuration.addAllowedOrigin("https://pading-c8f33.firebaseapp.com");
    configuration.addAllowedOrigin("http://localhost:5173");
    configuration.addAllowedOrigin("http://localhost:5174");
    configuration.addAllowedOrigin("https://pair-coding.site");
    configuration.addAllowedMethod("*"); // 모든 HTTP 메서드 허용
    configuration.addAllowedHeader("*"); // 모든 헤더 허용
    configuration.setAllowCredentials(true); // 자격 증명 허용

    UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
    source.registerCorsConfiguration("/**", configuration);

    return source;
  }
}