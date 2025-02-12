package site.paircoding.paircoding.controller;

import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import site.paircoding.paircoding.entity.dto.ProjectLanguageDto;
import site.paircoding.paircoding.entity.dto.ProjectOSDto;
import site.paircoding.paircoding.entity.dto.ProjectPerformanceDto;
import site.paircoding.paircoding.global.ApiResponse;
import site.paircoding.paircoding.service.ProjectService;

@RestController
@RequestMapping("/v1/projects/option")
@RequiredArgsConstructor
public class ProjectOptionController {

  private final ProjectService projectService;

  // 사용 가능한 언어 리스트 조회
  @GetMapping("/language")
  public ApiResponse<List<ProjectLanguageDto>> getLanguage() {
    return ApiResponse.success(projectService.getLanguage());
  }

  // 사용 가능한 OS 리스트 조회
  @GetMapping("/os")
  public ApiResponse<List<ProjectOSDto>> getOS(@RequestParam String language) {
    return ApiResponse.success(projectService.getOS(language));
  }

  // 사용 가능한 사양 리스트 조회
  @GetMapping("/performance")
  public ApiResponse<List<ProjectPerformanceDto>> getPerformance() {
    return ApiResponse.success(projectService.getPerformance());
  }
}
