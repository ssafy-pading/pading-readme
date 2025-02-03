// CreateGroupRequest.java
package site.paircoding.paircoding.entity.dto;

import lombok.Data;

@Data
public class CreateGroupRequest {
  private String name;
  private int capacity;
}