package site.paircoding.paircoding.entity.dto;

import java.util.List;
import lombok.Getter;
import lombok.Setter;
import site.paircoding.paircoding.entity.enums.DirectoryAction;

@Getter
@Setter
public class DirectoryListDto {

  private DirectoryAction action;
  private String path;
  private List<DirectoryChildren> children;

}
