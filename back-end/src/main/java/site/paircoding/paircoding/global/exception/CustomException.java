package site.paircoding.paircoding.global.exception;

import lombok.Getter;
import site.paircoding.paircoding.global.error.ErrorCode;

@Getter
public class CustomException extends RuntimeException {
  private ErrorCode errorCode;

  public CustomException(String message) {
    super(message);
  }

  public CustomException(ErrorCode errorCode, String message) {
    super(ErrorCode.UNEXPECTED.getMessage() + (message != null ? " : " + message : ""));
    this.errorCode = errorCode;
  }
}
