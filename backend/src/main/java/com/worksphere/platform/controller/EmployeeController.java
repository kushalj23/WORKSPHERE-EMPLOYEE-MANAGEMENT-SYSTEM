package com.worksphere.platform.controller;

import com.worksphere.platform.dto.EmployeeDto;
import com.worksphere.platform.security.UserPrincipal;
import com.worksphere.platform.service.EmployeeService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.core.io.InputStreamResource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/v1/employees")
public class EmployeeController {

    private final EmployeeService employeeService;

    public EmployeeController(EmployeeService employeeService) {
        this.employeeService = employeeService;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'HR_MANAGER', 'EMPLOYEE')")
    public ResponseEntity<Page<EmployeeDto>> getEmployees(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Long departmentId,
            @RequestParam(required = false) Long designationId,
            @RequestParam(required = false) String employmentType,
            @RequestParam(required = false) String employmentStatus,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir) {
        
        Sort sort = sortDir.equalsIgnoreCase("desc") ? Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);
        return ResponseEntity.ok(employeeService.getEmployees(search, departmentId, designationId, employmentType, employmentStatus, pageable));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR_MANAGER') or (hasRole('EMPLOYEE') and #id == authentication.principal.employeeId)")
    public ResponseEntity<EmployeeDto> getEmployeeById(@PathVariable Long id) {
        return ResponseEntity.ok(employeeService.getEmployeeById(id));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'HR_MANAGER')")
    public ResponseEntity<EmployeeDto> createEmployee(Principal principal, @Valid @RequestBody EmployeeDto employeeDto, HttpServletRequest request) {
        String ip = getClientIp(request);
        return ResponseEntity.ok(employeeService.createEmployee(employeeDto, principal.getName(), ip));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR_MANAGER') or (hasRole('EMPLOYEE') and #id == authentication.principal.employeeId)")
    public ResponseEntity<EmployeeDto> updateEmployee(Principal principal, @PathVariable Long id, @Valid @RequestBody EmployeeDto employeeDto, HttpServletRequest request) {
        String ip = getClientIp(request);
        return ResponseEntity.ok(employeeService.updateEmployee(id, employeeDto, principal.getName(), ip));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR_MANAGER')")
    public ResponseEntity<Void> deleteEmployee(Principal principal, @PathVariable Long id, HttpServletRequest request) {
        String ip = getClientIp(request);
        employeeService.deleteEmployee(id, principal.getName(), ip);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/birthdays")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR_MANAGER', 'EMPLOYEE')")
    public ResponseEntity<List<EmployeeDto>> getBirthdays() {
        return ResponseEntity.ok(employeeService.getBirthdaysThisMonth());
    }

    @GetMapping("/anniversaries")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR_MANAGER', 'EMPLOYEE')")
    public ResponseEntity<List<EmployeeDto>> getAnniversaries() {
        return ResponseEntity.ok(employeeService.getAnniversariesThisMonth());
    }

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAnyRole('ADMIN', 'HR_MANAGER')")
    public ResponseEntity<String> bulkUpload(Principal principal, @RequestParam("file") MultipartFile file, HttpServletRequest request) throws IOException {
        String ip = getClientIp(request);
        String response = employeeService.bulkUpload(file.getInputStream(), principal.getName(), ip);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/export/excel")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR_MANAGER')")
    public ResponseEntity<InputStreamResource> exportExcel() {
        ByteArrayInputStream in = employeeService.exportToExcel();
        HttpHeaders headers = new HttpHeaders();
        headers.add("Content-Disposition", "attachment; filename=employees.xlsx");
        return ResponseEntity.ok()
                .headers(headers)
                .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .body(new InputStreamResource(in));
    }

    @GetMapping("/export/pdf")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR_MANAGER')")
    public ResponseEntity<InputStreamResource> exportPdf() {
        ByteArrayInputStream in = employeeService.exportToPdf();
        HttpHeaders headers = new HttpHeaders();
        headers.add("Content-Disposition", "attachment; filename=employees.pdf");
        return ResponseEntity.ok()
                .headers(headers)
                .contentType(MediaType.APPLICATION_PDF)
                .body(new InputStreamResource(in));
    }

    private String getClientIp(HttpServletRequest request) {
        String ip = request.getHeader("X-Forwarded-For");
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getRemoteAddr();
        }
        return ip;
    }
}
