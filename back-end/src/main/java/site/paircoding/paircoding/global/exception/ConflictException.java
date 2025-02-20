package site.paircoding.paircoding.global.exception;

import lombok.Getter;
import site.paircoding.paircoding.global.error.ErrorCode;

@Getter
public class ConflictException extends CustomException {

  private final ErrorCode errorCode;

  public ConflictException() {
    super(ErrorCode.CONFLICT_EXCEPTION.getMessage());
    this.errorCode = ErrorCode.CONFLICT_EXCEPTION;
  }

  public ConflictException(String message) {
    super(ErrorCode.CONFLICT_EXCEPTION.getMessage() + " : " + message);
    this.errorCode = ErrorCode.CONFLICT_EXCEPTION;
  }
}
