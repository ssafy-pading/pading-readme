package site.paircoding.paircoding.global.exception;

import lombok.Getter;
import site.paircoding.paircoding.global.error.ErrorCode;

@Getter
public class BadRequestException extends CustomException {
  private final ErrorCode errorCode;

  public BadRequestException(String message, ErrorCode errorCode) {
    super(errorCode.getMessage() + message);
    this.errorCode = errorCode;
  }

  public BadRequestException(ErrorCode errorCode) {
    super(errorCode.getMessage());
    this.errorCode = errorCode;
  }

  public BadRequestException(ErrorCode errorCode, Object... args) {
    super(String.format(errorCode.getMessage(), args));
    this.errorCode = errorCode;
  }
}
