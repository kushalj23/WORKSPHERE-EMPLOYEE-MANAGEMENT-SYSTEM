package com.worksphere.platform.controller;

import com.worksphere.platform.dto.DesignationDto;
import com.worksphere.platform.service.DesignationService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/v1/designations")
public class DesignationController {

    private final DesignationService designationService;

    public DesignationController(DesignationService designationService) {
        this.designationService = designationService;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'HR_MANAGER', 'EMPLOYEE')")
    public ResponseEntity<List<DesignationDto>> getAllDesignations() {
        return ResponseEntity.ok(designationService.getAllDesignations());
    }

    @GetMapping("/department/{departmentId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR_MANAGER', 'EMPLOYEE')")
    public ResponseEntity<List<DesignationDto>> getDesignationsByDepartment(@PathVariable Long departmentId) {
        return ResponseEntity.ok(designationService.getDesignationsByDepartment(departmentId));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR_MANAGER', 'EMPLOYEE')")
    public ResponseEntity<DesignationDto> getDesignationById(@PathVariable Long id) {
        return ResponseEntity.ok(designationService.getDesignationById(id));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'HR_MANAGER')")
    public ResponseEntity<DesignationDto> createDesignation(Principal principal, @Valid @RequestBody DesignationDto designationDto, HttpServletRequest request) {
        String ip = getClientIp(request);
        return ResponseEntity.ok(designationService.createDesignation(designationDto, principal.getName(), ip));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR_MANAGER')")
    public ResponseEntity<DesignationDto> updateDesignation(Principal principal, @PathVariable Long id, @Valid @RequestBody DesignationDto designationDto, HttpServletRequest request) {
        String ip = getClientIp(request);
        return ResponseEntity.ok(designationService.updateDesignation(id, designationDto, principal.getName(), ip));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR_MANAGER')")
    public ResponseEntity<Void> deleteDesignation(Principal principal, @PathVariable Long id, HttpServletRequest request) {
        String ip = getClientIp(request);
        designationService.deleteDesignation(id, principal.getName(), ip);
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
