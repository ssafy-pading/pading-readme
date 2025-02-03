package site.paircoding.paircoding.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import site.paircoding.paircoding.entity.dto.AuthRequest;
import site.paircoding.paircoding.entity.dto.AuthResponse;
import site.paircoding.paircoding.global.ApiResponse;
import site.paircoding.paircoding.service.AuthService;

@RestController
@RequiredArgsConstructor
@RequestMapping("/v1/auth")
public class AuthController {
  private final AuthService authService;

  @PostMapping("/refresh")
  public ApiResponse<AuthResponse> refreshAccessToken(@RequestBody AuthRequest authRequest) {
    AuthResponse authResponse = authService.refresh(authRequest.getRefreshToken());
    return ApiResponse.success(authResponse);
  }
}