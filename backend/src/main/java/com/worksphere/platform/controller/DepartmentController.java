package com.worksphere.platform.controller;

import com.worksphere.platform.dto.DepartmentDto;
import com.worksphere.platform.service.DepartmentService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/v1/departments")
public class DepartmentController {

    private final DepartmentService departmentService;

    public DepartmentController(DepartmentService departmentService) {
        this.departmentService = departmentService;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'HR_MANAGER', 'EMPLOYEE')")
    public ResponseEntity<List<DepartmentDto>> getAllDepartments() {
        return ResponseEntity.ok(departmentService.getAllDepartments());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR_MANAGER', 'EMPLOYEE')")
    public ResponseEntity<DepartmentDto> getDepartmentById(@PathVariable Long id) {
        return ResponseEntity.ok(departmentService.getDepartmentById(id));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'HR_MANAGER')")
    public ResponseEntity<DepartmentDto> createDepartment(Principal principal, @Valid @RequestBody DepartmentDto departmentDto, HttpServletRequest request) {
        String ip = getClientIp(request);
        return ResponseEntity.ok(departmentService.createDepartment(departmentDto, principal.getName(), ip));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR_MANAGER')")
    public ResponseEntity<DepartmentDto> updateDepartment(Principal principal, @PathVariable Long id, @Valid @RequestBody DepartmentDto departmentDto, HttpServletRequest request) {
        String ip = getClientIp(request);
        return ResponseEntity.ok(departmentService.updateDepartment(id, departmentDto, principal.getName(), ip));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR_MANAGER')")
    public ResponseEntity<Void> deleteDepartment(Principal principal, @PathVariable Long id, HttpServletRequest request) {
        String ip = getClientIp(request);
        departmentService.deleteDepartment(id, principal.getName(), ip);
        return ResponseEntity.noContent().build();
    }

    private String getClientIp(HttpServletRequest request) {
        String ip = request.getHeader("X-Forwarded-For");
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getRemoteAddr();
        }
        return ip;
    }
}
