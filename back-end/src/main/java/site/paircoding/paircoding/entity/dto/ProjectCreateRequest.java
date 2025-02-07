package site.paircoding.paircoding.entity.dto;

import java.util.List;
import lombok.Getter;

@Getter
public class ProjectCreateRequest {

  private String name;
  private String language;
  private String os;
  private Integer performanceId;
  private List<Integer> userIds;

}
