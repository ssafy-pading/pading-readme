package site.paircoding.paircoding.entity.dto;

import lombok.Getter;
import site.paircoding.paircoding.entity.enums.DirectoryAction;
import site.paircoding.paircoding.entity.enums.DirectoryType;

@Getter
public class DirectoryCreateDto {

  private DirectoryType type;
  private DirectoryAction action;
  private String path;
  private String name;

}
