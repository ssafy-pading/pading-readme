package site.paircoding.paircoding.global.error;

import lombok.AllArgsConstructor;
import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
@AllArgsConstructor
public enum ErrorCode {
  UNEXPECTED(HttpStatus.INTERNAL_SERVER_ERROR, "-1", "Unexpected exception occurred"),
  BAD_REQUEST_EXCEPTION(HttpStatus.BAD_REQUEST, "C001", "Bad request"),
  FORBIDDEN_EXCEPTION(HttpStatus.FORBIDDEN, "C002", "Forbidden"),
  NOT_FOUND_EXCEPTION(HttpStatus.NOT_FOUND, "C003", "Not found"),
  UNAUTHORIZED_EXCEPTION(HttpStatus.UNAUTHORIZED, "C004", "Unauthorized"),
  CONFLICT_EXCEPTION(HttpStatus.CONFLICT, "C005", "Conflict occurred");

  private final HttpStatus status;
  private final String code;
  private final String message;
}