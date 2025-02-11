package site.paircoding.paircoding.entity.dto;

import java.util.List;
import lombok.Builder;
import lombok.Getter;

@Builder
@Getter
public class ProjectWithUsersResponse {

  private ProjectDto project;
  private List<UserDto> users;
}
