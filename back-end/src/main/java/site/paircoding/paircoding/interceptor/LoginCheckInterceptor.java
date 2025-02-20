package site.paircoding.paircoding.interceptor;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.method.HandlerMethod;
import org.springframework.web.servlet.HandlerInterceptor;
import site.paircoding.paircoding.annotaion.LoginCheck;
import site.paircoding.paircoding.global.exception.UnauthorizedException;

@Component
public class LoginCheckInterceptor implements HandlerInterceptor {

  @Override
  public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler)
      throws Exception {

    // 핸들러가 HandlerMethod일 경우, 어노테이션 체크
    if (handler instanceof HandlerMethod handlerMethod) {

      // 메서드 or 클래스에 @LoginRequired가 있는지 확인
      if (handlerMethod.hasMethodAnnotation(LoginCheck.class) ||
          handlerMethod.getBeanType().isAnnotationPresent(LoginCheck.class)) {

        // SecurityContextHolder에서 인증 객체 가져오기
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        // 인증 객체가 존재하지 않거나, 익명 사용자라면 로그인 필요
        if (authentication == null || !authentication.isAuthenticated() ||
            authentication.getPrincipal().equals("anonymousUser")) {
          throw new UnauthorizedException("로그인 후 이용해주세요.");
        }
      }
    }

    return true;
  }
}

