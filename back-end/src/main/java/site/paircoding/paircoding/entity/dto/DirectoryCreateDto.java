package site.paircoding.paircoding.entity.dto;

import lombok.Getter;
import site.paircoding.paircoding.entity.enums.DirectoryAction;
import site.paircoding.paircoding.entity.enums.DirectoryType;

@Getter
public class DirectoryCreateDto {

  private DirectoryAction action;
  private DirectoryType type;
  private String path;
  private String name;

}
