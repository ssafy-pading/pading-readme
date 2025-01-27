package site.paircoding.paircoding.global.error;

import java.util.Arrays;
import java.util.Optional;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import site.paircoding.paircoding.global.ApiResponse;
import site.paircoding.paircoding.global.exception.BadRequestException;
import site.paircoding.paircoding.global.exception.CustomException;
import site.paircoding.paircoding.global.exception.ForbiddenException;
import site.paircoding.paircoding.global.exception.NotFoundException;
import site.paircoding.paircoding.global.exception.UnauthorizedException;

@Slf4j
@RestControllerAdvice
public class ControllerExceptionHandler {


  // 오류 코드, 메시지, HTTP 상태를 받아 새로운 ResponseEntity를 생성하는 메서드
  private ResponseEntity<ApiResponse<?>> newResponseEntity(CustomException ex) {
    return ResponseEntity.status(ex.getErrorCode().getStatus()).body(ApiResponse.error(ex.getErrorCode().getCode(), ex.getMessage()));
  }

  // UnauthorizedException을 처리하는 메서드
  @ExceptionHandler(UnauthorizedException.class)
  public ResponseEntity<ApiResponse<?>> unauthorizedHandler(UnauthorizedException ex) {
    log.debug("UnauthorizedException occurred: {}", ex.getMessage(), ex);
    return newResponseEntity(ex);
  }

  // ForbiddenException을 처리하는 메서드
  @ExceptionHandler(ForbiddenException.class)
  public ResponseEntity<ApiResponse<?>> forbiddenHandler(ForbiddenException ex) {
    log.debug("ForbiddenException occurred: {}", ex.getMessage(), ex);
    return newResponseEntity(ex);
  }
  // NotFoundException을 처리하는 메서드
  @ExceptionHandler(NotFoundException.class)
  public ResponseEntity<ApiResponse<?>> notFoundHandler(NotFoundException ex) {
    log.debug("NotFoundException occurred: {}", ex.getMessage(), ex);
    return newResponseEntity(ex);
  }

  // BadRequestException을 처리하는 메서드
  @ExceptionHandler(BadRequestException.class)
  public ResponseEntity<ApiResponse<?>> badRequestException(BadRequestException ex) {
    log.debug("BadRequestException occurred: {}", ex.getMessage(), ex);
    return newResponseEntity(ex);
  }

  //CustomException을 처리하는 메서드
  @ExceptionHandler(CustomException.class)
  public ResponseEntity<ApiResponse<?>> handleCustomException(CustomException ex) {
    log.debug("CustomException occurred: {}", ex.getMessage(), ex);
    return newResponseEntity(ex);
  }

  // 일반적인 예외와 런타임 예외를 처리하는 메서드
  @ExceptionHandler({Exception.class})
  public ResponseEntity<ApiResponse<?>> serverErrorHandler(Exception ex) {
    log.error("Unexpected exception occurred: {}", ex.getStackTrace(), ex);
    CustomException customException = new CustomException(ErrorCode.UNEXPECTED, ex.getMessage());
    return newResponseEntity(customException);
  }
}