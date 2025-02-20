package site.paircoding.paircoding.entity.dto;

import java.util.List;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class GroupUsersResponse {

  private List<GroupUserResponse> users;

  public GroupUsersResponse(List<GroupUserResponse> users) {
    this.users = users;
  }
}
