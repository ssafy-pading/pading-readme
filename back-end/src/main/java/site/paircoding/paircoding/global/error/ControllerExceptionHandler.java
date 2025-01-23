
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
import site.paircoding.paircoding.global.exception.ForbiddenException;
import site.paircoding.paircoding.global.exception.NotFoundException;
import site.paircoding.paircoding.global.exception.UnauthorizedException;

@Slf4j
@RestControllerAdvice
public class ControllerExceptionHandler {

  private ResponseEntity<ApiResponse<?>> newResponseEntity(Throwable throwable, HttpStatus status) {
    Optional<String> message = Arrays.stream(throwable.getStackTrace())
        .map(StackTraceElement::toString)
        .reduce((a, b) -> a + " " + b);

    return newResponseEntity(ErrorCode.UNEXPECTED.getCode(),
        message.orElse(throwable.getMessage()), status);
  }

  private ResponseEntity<ApiResponse<?>> newResponseEntity(String code, String message, HttpStatus status) {
    return ResponseEntity.status(status).body(ApiResponse.error(code, message));
  }

  @ExceptionHandler(UnauthorizedException.class)
  public ResponseEntity<ApiResponse<?>> unauthorizedHandler(UnauthorizedException ex) {
    log.error("UnauthorizedException occurred: {}", ex.getMessage(), ex);
    return newResponseEntity(ex.getErrorCode().getCode(), ex.getMessage(), HttpStatus.UNAUTHORIZED);
  }

  @ExceptionHandler(ForbiddenException.class)
  public ResponseEntity<ApiResponse<?>> forbiddenHandler(ForbiddenException ex) {
    log.error("ForbiddenException occurred: {}", ex.getMessage(), ex);
    return newResponseEntity(ex.getErrorCode().getCode(), ex.getMessage(), HttpStatus.FORBIDDEN);
  }

  @ExceptionHandler(NotFoundException.class)
  public ResponseEntity<ApiResponse<?>> notFoundHandler(NotFoundException ex) {
    log.error("NotFoundException occurred: {}", ex.getMessage(), ex);
    return newResponseEntity(ex.getErrorCode().getCode(), ex.getMessage(), HttpStatus.NOT_FOUND);
  }

  @ExceptionHandler(BadRequestException.class)
  public ResponseEntity<ApiResponse<?>> badRequestException(BadRequestException ex) {
    log.error("BadRequestException occurred: {}", ex.getMessage(), ex);

    return newResponseEntity(ex.getErrorCode().getCode(), ex.getMessage(),
        HttpStatus.BAD_REQUEST);
  }

  @ExceptionHandler({Exception.class, RuntimeException.class})
  public ResponseEntity<ApiResponse<?>> serverErrorHandler(Exception ex) {
    log.error("Unexpected exception occurred: {}", ex.getMessage(), ex);
    return newResponseEntity(ex, HttpStatus.INTERNAL_SERVER_ERROR);
  }
}
