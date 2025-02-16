package site.paircoding.paircoding.entity.dto;

import lombok.Getter;
import lombok.Setter;
import site.paircoding.paircoding.entity.enums.DirectoryAction;
import site.paircoding.paircoding.entity.enums.DirectoryType;

@Getter
public class DirectoryContentDto {

  private DirectoryAction action;
  private DirectoryType type;
  private String path;
  private String name;
  @Setter
  private String content;

}
