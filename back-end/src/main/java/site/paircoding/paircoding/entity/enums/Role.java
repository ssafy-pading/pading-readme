package site.paircoding.paircoding.entity.enums;

import lombok.Getter;

@Getter
public enum Role {
  OWNER(3),
  MANAGER(2),
  MEMBER(1);

  private final int level;

  Role(int level) {
    this.level = level;
  }

}
