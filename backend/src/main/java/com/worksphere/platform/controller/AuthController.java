package com.worksphere.platform.controller;

import com.worksphere.platform.dto.*;
import com.worksphere.platform.service.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.security.Principal;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public ResponseEntity<JwtResponse> authenticateUser(@Valid @RequestBody LoginRequest loginRequest, HttpServletRequest request) {
        String ip = getClientIp(request);
        return ResponseEntity.ok(authService.login(loginRequest, ip));
    }

    @PostMapping("/register")
    public ResponseEntity<String> registerUser(@Valid @RequestBody RegisterRequest registerRequest, HttpServletRequest request) {
        String ip = getClientIp(request);
        authService.register(registerRequest, ip);
        return ResponseEntity.ok("User registered successfully!");
    }

    @PostMapping("/refresh")
    public ResponseEntity<TokenRefreshResponse> refreshSession(@Valid @RequestBody TokenRefreshRequest refreshRequest) {
        return ResponseEntity.ok(authService.refreshToken(refreshRequest));
    }

    @PostMapping("/change-password")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<String> changePassword(Principal principal, @Valid @RequestBody ChangePasswordRequest changeRequest, HttpServletRequest request) {
        String ip = getClientIp(request);
        authService.changePassword(principal.getName(), changeRequest, ip);
        return ResponseEntity.ok("Password changed successfully!");
    }

    private String getClientIp(HttpServletRequest request) {
        String ip = request.getHeader("X-Forwarded-For");
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getRemoteAddr();
        }
        return ip;
    }
}
