package site.paircoding.paircoding.global.exception;

import lombok.Getter;
import site.paircoding.paircoding.global.error.ErrorCode;

@Getter
public class UnauthorizedException extends CustomException {
  private final ErrorCode errorCode;


  public UnauthorizedException(String message, ErrorCode errorCode) {
    super(errorCode.getMessage() + message);
    this.errorCode = errorCode;
  }

  public UnauthorizedException(ErrorCode errorCode) {
    super(errorCode.getMessage());
    this.errorCode = errorCode;
  }

  public UnauthorizedException(ErrorCode errorCode, Object... args) {
    super(String.format(errorCode.getMessage(), args));
    this.errorCode = errorCode;
  }
}
