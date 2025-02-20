package site.paircoding.paircoding.aop;

import java.lang.reflect.Method;
import java.lang.reflect.Parameter;
import lombok.RequiredArgsConstructor;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.reflect.MethodSignature;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.bind.annotation.PathVariable;
import site.paircoding.paircoding.annotaion.GroupRoleCheck;
import site.paircoding.paircoding.config.oauth.CustomUserDetails;
import site.paircoding.paircoding.entity.GroupUser;
import site.paircoding.paircoding.global.exception.ForbiddenException;
import site.paircoding.paircoding.global.exception.UnauthorizedException;
import site.paircoding.paircoding.repository.GroupUserRepository;

@Aspect
@Component
@RequiredArgsConstructor
public class GroupRoleCheckAspect {

  private final GroupUserRepository groupUserRepository;

  @Around("@annotation(groupRoleCheck)")
  public Object checkPermission(ProceedingJoinPoint joinPoint,
      GroupRoleCheck groupRoleCheck) throws Throwable {

    // SecurityContextHolder에서 인증 객체 가져오기
    Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

    // 인증 객체가 존재하지 않거나, 익명 사용자라면 로그인 필요
    if (authentication == null || !authentication.isAuthenticated() ||
        authentication.getPrincipal().equals("anonymousUser")) {
      throw new UnauthorizedException("로그인 후 이용해주세요.");
    }

    // @AuthenticationPrincipal로 받은 유저 정보
    CustomUserDetails customUserDetails = (CustomUserDetails) SecurityContextHolder.getContext()
        .getAuthentication().getPrincipal();

    // @PathVariable로 받은 groupId
    Integer groupId = extractGroupId(joinPoint);

    GroupUser groupUser = groupUserRepository.findByGroupIdAndUserId(groupId,
            customUserDetails.getUser().getId())
        .orElseThrow(() -> new ForbiddenException("접근 권한이 없습니다."));

    // 그룹 내에서 유저의 역할을 확인
    if (groupUser.getRole().getLevel() < groupRoleCheck.value().getLevel()) {
      throw new ForbiddenException("접근 권한이 없습니다.");
    }

    return joinPoint.proceed();  // 역할이 확인되면 실제 메서드를 실행
  }

  private Integer extractGroupId(ProceedingJoinPoint joinPoint) {
    MethodSignature signature = (MethodSignature) joinPoint.getSignature();
    Method method = signature.getMethod();
    Parameter[] parameters = method.getParameters();
    Object[] args = joinPoint.getArgs();

    for (int i = 0; i < parameters.length; i++) {
      PathVariable pathVariable = parameters[i].getAnnotation(PathVariable.class);
      if (pathVariable != null) {
        if ("groupId".equals(pathVariable.value())) {
          return (Integer) args[i];
        }
      }
    }
    throw new RuntimeException("Group ID not found");
  }
}
