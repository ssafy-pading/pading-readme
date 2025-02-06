// GroupsResponse.java
package site.paircoding.paircoding.entity.dto;

import java.util.List;
import lombok.Getter;
import lombok.Setter;
import site.paircoding.paircoding.entity.Group;

@Getter
@Setter
public class GroupsResponse {

  private List<Group> groups;

  public GroupsResponse(List<Group> groups) {
    this.groups = groups;
  }
}