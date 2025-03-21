package site.paircoding.paircoding.config.jwt;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import site.paircoding.paircoding.config.oauth.CustomUserDetails;
import site.paircoding.paircoding.entity.User;
import site.paircoding.paircoding.global.exception.UnauthorizedException;
import site.paircoding.paircoding.repository.UserRepository;
import site.paircoding.paircoding.util.JwtUtil;

@Component
@RequiredArgsConstructor
public class JwtFilter extends OncePerRequestFilter {

  private final JwtUtil jwtUtil;
  private final UserRepository userRepository;

  @Override
  protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
      FilterChain filterChain) throws ServletException, IOException {
    String bearerToken = request.getHeader("Authorization");

    if (bearerToken != null && bearerToken.startsWith("Bearer ")) {
      String token = bearerToken.substring(7);
      User user;

      if (jwtUtil.validateToken(token, response)) {
        user = userRepository.findById(jwtUtil.getId(token))
            .orElseThrow(() -> new UnauthorizedException("Invalid token"));
        OAuth2User oAuth2User = new CustomUserDetails(user);
        Authentication authentication = new UsernamePasswordAuthenticationToken(oAuth2User, "",
            oAuth2User.getAuthorities());

        SecurityContextHolder.getContext().setAuthentication(authentication);
      } else {
        return;
      }
    }

    filterChain.doFilter(request, response);
  }
}