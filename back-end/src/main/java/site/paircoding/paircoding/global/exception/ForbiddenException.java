package site.paircoding.paircoding.global.exception;

import lombok.Getter;
import site.paircoding.paircoding.global.error.ErrorCode;

@Getter
public class ForbiddenException extends CustomException {
  private final ErrorCode errorCode;


  public ForbiddenException(String message, ErrorCode errorCode) {
    super(errorCode.getMessage() + message);
    this.errorCode = errorCode;
  }

  public ForbiddenException(ErrorCode errorCode) {
    super(errorCode.getMessage());
    this.errorCode = errorCode;
  }

  public ForbiddenException(ErrorCode errorCode, Object... args) {
    super(String.format(errorCode.getMessage(), args));
    this.errorCode = errorCode;
  }
}
