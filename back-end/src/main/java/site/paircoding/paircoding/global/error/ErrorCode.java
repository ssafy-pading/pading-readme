package site.paircoding.paircoding.global.error;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public enum ErrorCode {
  UNEXPECTED(-1, "-1", "Unexpected exception occurred"),

  BAD_REQUEST_EXCEPTION(400, "C001", "Bad request"),
  FORBIDDEN_EXCEPTION(403, "C002", "Forbidden"),
  NOT_FOUND_EXCEPTION(404, "C003", "Not found"),
  UNAUTHORIZED_EXCEPTION(401, "C004", "Unauthorized");

  private final int status;
  private final String code;
  private final String message;
}