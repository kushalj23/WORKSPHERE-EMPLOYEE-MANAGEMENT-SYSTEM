package com.worksphere.platform.controller;

import com.worksphere.platform.dto.AuditLogDto;
import com.worksphere.platform.entity.User;
import com.worksphere.platform.service.UserService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/v1/users")
@PreAuthorize("hasRole('ADMIN')")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    @PutMapping("/{id}/role")
    public ResponseEntity<User> updateUserRole(
            Principal principal,
            @PathVariable Long id,
            @RequestParam String role,
            HttpServletRequest request) {
        String ip = getClientIp(request);
        return ResponseEntity.ok(userService.updateUserRole(id, role, principal.getName(), ip));
    }

    @PutMapping("/{id}/toggle")
    public ResponseEntity<User> toggleUserStatus(
            Principal principal,
            @PathVariable Long id,
            HttpServletRequest request) {
        String ip = getClientIp(request);
        return ResponseEntity.ok(userService.toggleUserStatus(id, principal.getName(), ip));
    }

    @GetMapping("/logs")
    public ResponseEntity<List<AuditLogDto>> getAuditLogs() {
        return ResponseEntity.ok(userService.getAuditLogs());
    }

    private String getClientIp(HttpServletRequest request) {
        String ip = request.getHeader("X-Forwarded-For");
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getRemoteAddr();
        }
        return ip;
    }
}
