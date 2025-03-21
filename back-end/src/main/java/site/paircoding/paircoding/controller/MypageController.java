package site.paircoding.paircoding.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import site.paircoding.paircoding.annotaion.LoginCheck;
import site.paircoding.paircoding.annotaion.LoginUser;
import site.paircoding.paircoding.entity.User;
import site.paircoding.paircoding.entity.dto.UserDto;
import site.paircoding.paircoding.global.ApiResponse;
import site.paircoding.paircoding.service.UserService;
import site.paircoding.paircoding.util.JwtUtil;

@RestController
@RequiredArgsConstructor
@RequestMapping("/v1/mypage")
public class MypageController {

  private final UserService userService;
  private final JwtUtil jwtUtil;

  @LoginCheck
  @GetMapping
  public ApiResponse<Object> getUserById(
      @LoginUser User user) {
    UserDto userDto = UserDto.builder()
        .id(user.getId())
        .name(user.getName())
        .image(user.getImage())
        .email(user.getEmail())
        .build();
    return ApiResponse.success(userDto);
  }

  @DeleteMapping("/logout")
  public ApiResponse<Object> logout() {
    //리프레시 토큰 삭제
    jwtUtil.deleteRefreshToken(SecurityContextHolder.getContext().getAuthentication().getName());
    return ApiResponse.success();
  }

//  @DeleteMapping
//  public ApiResponse<Object> deleteUser(
//      @AuthenticationPrincipal CustomUserDetails customUserDetails) {
//    userService.deleteUser(customUserDetails.getUser().getId());
//    return ApiResponse.success();
//  }
}
