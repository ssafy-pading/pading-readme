package site.paircoding.paircoding.entity.dto;

import java.util.List;
import lombok.Builder;
import lombok.Getter;

@Builder
@Getter
public class ProjectWithUsersResponse {

  private Project project;
  private List<ProjectUserDto> users;
}