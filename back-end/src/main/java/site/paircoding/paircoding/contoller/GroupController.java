package site.paircoding.paircoding.contoller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import site.paircoding.paircoding.global.ApiResponse;
import site.paircoding.paircoding.service.GroupService;

@RestController
@RequiredArgsConstructor
@RequestMapping("v1/groups")
public class GroupController {
    private final GroupService groupService;

    @GetMapping
    public ApiResponse<Object> getGroups() {
        groupService.getGroups();
        return ApiResponse.success();
    }
}
