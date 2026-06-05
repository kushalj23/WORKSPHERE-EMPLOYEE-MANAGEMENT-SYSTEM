package com.worksphere.platform.controller;

import com.worksphere.platform.dto.AttendanceDto;
import com.worksphere.platform.exception.BadRequestException;
import com.worksphere.platform.security.UserPrincipal;
import com.worksphere.platform.service.AttendanceService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.security.Principal;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/v1/attendance")
public class AttendanceController {

    private final AttendanceService attendanceService;

    public AttendanceController(AttendanceService attendanceService) {
        this.attendanceService = attendanceService;
    }

    @PostMapping("/clock-in")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<AttendanceDto> clockIn(@AuthenticationPrincipal UserPrincipal principal, HttpServletRequest request) {
        if (principal.getEmployeeId() == null) {
            throw new BadRequestException("This user account is not linked to any Employee profile");
        }
        String ip = getClientIp(request);
        return ResponseEntity.ok(attendanceService.clockIn(principal.getEmployeeId(), principal.getUsername(), ip));
    }

    @PostMapping("/clock-out")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<AttendanceDto> clockOut(@AuthenticationPrincipal UserPrincipal principal, HttpServletRequest request) {
        if (principal.getEmployeeId() == null) {
            throw new BadRequestException("This user account is not linked to any Employee profile");
        }
        String ip = getClientIp(request);
        return ResponseEntity.ok(attendanceService.clockOut(principal.getEmployeeId(), principal.getUsername(), ip));
    }

    @GetMapping("/daily")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR_MANAGER')")
    public ResponseEntity<List<AttendanceDto>> getDailyAttendance(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(attendanceService.getDailyAttendance(date));
    }

    @GetMapping("/history/{employeeId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR_MANAGER') or (hasRole('EMPLOYEE') and #employeeId == authentication.principal.employeeId)")
    public ResponseEntity<List<AttendanceDto>> getEmployeeHistory(
            @PathVariable Long employeeId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate start,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate end) {
        return ResponseEntity.ok(attendanceService.getEmployeeHistory(employeeId, start, end));
    }

    private String getClientIp(HttpServletRequest request) {
        String ip = request.getHeader("X-Forwarded-For");
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getRemoteAddr();
        }
        return ip;
    }
}
