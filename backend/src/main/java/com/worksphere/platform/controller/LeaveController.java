package com.worksphere.platform.controller;

import com.worksphere.platform.dto.LeaveRequestDto;
import com.worksphere.platform.exception.BadRequestException;
import com.worksphere.platform.security.UserPrincipal;
import com.worksphere.platform.service.LeaveService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.security.Principal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/leaves")
public class LeaveController {

    private final LeaveService leaveService;

    public LeaveController(LeaveService leaveService) {
        this.leaveService = leaveService;
    }

    @PostMapping("/apply")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<LeaveRequestDto> applyLeave(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody LeaveRequestDto leaveRequestDto,
            HttpServletRequest request) {
        if (principal.getEmployeeId() == null) {
            throw new BadRequestException("This user account is not linked to any Employee profile");
        }
        leaveRequestDto.setEmployeeId(principal.getEmployeeId());
        String ip = getClientIp(request);
        return ResponseEntity.ok(leaveService.applyLeave(leaveRequestDto, principal.getUsername(), ip));
    }

    @PostMapping("/{id}/approve")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR_MANAGER')")
    public ResponseEntity<LeaveRequestDto> approveLeave(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id,
            @RequestParam(required = false) String comments,
            HttpServletRequest request) {
        if (principal.getEmployeeId() == null) {
            throw new BadRequestException("This admin/HR account is not linked to an Employee profile to authorize this action");
        }
        String ip = getClientIp(request);
        return ResponseEntity.ok(leaveService.approveOrRejectLeave(id, "APPROVED", comments, principal.getEmployeeId(), principal.getUsername(), ip));
    }

    @PostMapping("/{id}/reject")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR_MANAGER')")
    public ResponseEntity<LeaveRequestDto> rejectLeave(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id,
            @RequestParam(required = false) String comments,
            HttpServletRequest request) {
        if (principal.getEmployeeId() == null) {
            throw new BadRequestException("This admin/HR account is not linked to an Employee profile to authorize this action");
        }
        String ip = getClientIp(request);
        return ResponseEntity.ok(leaveService.approveOrRejectLeave(id, "REJECTED", comments, principal.getEmployeeId(), principal.getUsername(), ip));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'HR_MANAGER')")
    public ResponseEntity<List<LeaveRequestDto>> getAllLeaveRequests() {
        return ResponseEntity.ok(leaveService.getAllLeaveRequests());
    }

    @GetMapping("/employee/{employeeId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR_MANAGER') or (hasRole('EMPLOYEE') and #employeeId == authentication.principal.employeeId)")
    public ResponseEntity<List<LeaveRequestDto>> getEmployeeLeaveHistory(@PathVariable Long employeeId) {
        return ResponseEntity.ok(leaveService.getEmployeeLeaveHistory(employeeId));
    }

    @GetMapping("/balance/{employeeId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR_MANAGER') or (hasRole('EMPLOYEE') and #employeeId == authentication.principal.employeeId)")
    public ResponseEntity<Map<String, Object>> getLeaveBalance(@PathVariable Long employeeId) {
        return ResponseEntity.ok(leaveService.getLeaveBalance(employeeId));
    }

    private String getClientIp(HttpServletRequest request) {
        String ip = request.getHeader("X-Forwarded-For");
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getRemoteAddr();
        }
        return ip;
    }
}
