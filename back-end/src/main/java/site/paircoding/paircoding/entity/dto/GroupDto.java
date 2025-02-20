package site.paircoding.paircoding.entity.dto;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class GroupDto {

  private int id;
  private String name;
  private int capacity;
}
