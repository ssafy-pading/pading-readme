package site.paircoding.paircoding.entity.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;
import site.paircoding.paircoding.entity.enums.DirectoryType;

@Getter
@Setter
@AllArgsConstructor
public class DirectoryChildren {

  private Integer id;
  private DirectoryType type;
  private String name;
}
