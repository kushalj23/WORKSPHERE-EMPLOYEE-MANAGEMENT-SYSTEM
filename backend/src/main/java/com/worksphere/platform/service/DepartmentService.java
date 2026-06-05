package com.worksphere.platform.service;

import com.worksphere.platform.dto.DepartmentDto;
import com.worksphere.platform.dto.Mapper;
import com.worksphere.platform.entity.Department;
import com.worksphere.platform.entity.Employee;
import com.worksphere.platform.exception.BadRequestException;
import com.worksphere.platform.exception.ResourceNotFoundException;
import com.worksphere.platform.repository.DepartmentRepository;
import com.worksphere.platform.repository.EmployeeRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class DepartmentService {

    private final DepartmentRepository departmentRepository;
    private final EmployeeRepository employeeRepository;
    private final AuditLogService auditLogService;

    public DepartmentService(DepartmentRepository departmentRepository,
                             EmployeeRepository employeeRepository,
                             AuditLogService auditLogService) {
        this.departmentRepository = departmentRepository;
        this.employeeRepository = employeeRepository;
        this.auditLogService = auditLogService;
    }

    @Transactional(readOnly = true)
    public List<DepartmentDto> getAllDepartments() {
        return departmentRepository.findAll().stream().map(dept -> {
            long count = employeeRepository.count((root, query, cb) -> cb.equal(root.get("department").get("id"), dept.getId()));
            return Mapper.toDepartmentDto(dept, count);
        }).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public DepartmentDto getDepartmentById(Long id) {
        Department dept = departmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Department not found with id: " + id));
        long count = employeeRepository.count((root, query, cb) -> cb.equal(root.get("department").get("id"), dept.getId()));
        return Mapper.toDepartmentDto(dept, count);
    }

    @Transactional
    public DepartmentDto createDepartment(DepartmentDto dto, String adminEmail, String ipAddress) {
        if (departmentRepository.existsByName(dto.getName())) {
            throw new BadRequestException("Department name already exists");
        }

        Employee manager = null;
        if (dto.getManagerId() != null) {
            manager = employeeRepository.findById(dto.getManagerId())
                    .orElseThrow(() -> new ResourceNotFoundException("Manager employee not found"));
        }

        Department dept = Department.builder()
                .name(dto.getName())
                .description(dto.getDescription())
                .manager(manager)
                .build();

        Department saved = departmentRepository.save(dept);
        auditLogService.log(adminEmail, "DEPARTMENT_CREATION", "Created department: " + saved.getName(), ipAddress);
        return Mapper.toDepartmentDto(saved, 0L);
    }

    @Transactional
    public DepartmentDto updateDepartment(Long id, DepartmentDto dto, String adminEmail, String ipAddress) {
        Department dept = departmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Department not found"));

        if (!dept.getName().equals(dto.getName()) && departmentRepository.existsByName(dto.getName())) {
            throw new BadRequestException("Department name already exists");
        }

        Employee manager = null;
        if (dto.getManagerId() != null) {
            manager = employeeRepository.findById(dto.getManagerId())
                    .orElseThrow(() -> new ResourceNotFoundException("Manager employee not found"));
        }

        dept.setName(dto.getName());
        dept.setDescription(dto.getDescription());
        dept.setManager(manager);

        Department saved = departmentRepository.save(dept);
        long count = employeeRepository.count((root, query, cb) -> cb.equal(root.get("department").get("id"), saved.getId()));
        auditLogService.log(adminEmail, "DEPARTMENT_UPDATE", "Updated department: " + saved.getName(), ipAddress);
        return Mapper.toDepartmentDto(saved, count);
    }

    @Transactional
    public void deleteDepartment(Long id, String adminEmail, String ipAddress) {
        Department dept = departmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Department not found"));
        departmentRepository.delete(dept);
        auditLogService.log(adminEmail, "DEPARTMENT_DELETION", "Deleted department: " + dept.getName(), ipAddress);
    }
}
