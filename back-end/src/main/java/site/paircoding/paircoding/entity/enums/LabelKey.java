package site.paircoding.paircoding.entity.enums;

import lombok.Getter;

@Getter
public enum LabelKey {
  ENV("env"),
  GROUP_ID("groupId"),
  DEPLOYMENT_NAME("deploymentName");

  private final String key;

  LabelKey(String key) {
    this.key = key;
  }
}
