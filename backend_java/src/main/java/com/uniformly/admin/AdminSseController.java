package com.uniformly.admin;

import com.uniformly.auth.SecurityUtils;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

@RestController
@RequestMapping("/api/v1/admin")
public class AdminSseController {

    private final AdminSseService adminSseService;

    public AdminSseController(AdminSseService adminSseService) {
        this.adminSseService = adminSseService;
    }

    @GetMapping(value = "/stream", produces = org.springframework.http.MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter streamEvents() {
        Long userId = SecurityUtils.getAuthenticatedUserId();
        // The endpoint is already protected by WebSecurityConfig which enforces /api/v1/admin/** for ADMIN role only.
        return adminSseService.createEmitter(userId);
    }
}
