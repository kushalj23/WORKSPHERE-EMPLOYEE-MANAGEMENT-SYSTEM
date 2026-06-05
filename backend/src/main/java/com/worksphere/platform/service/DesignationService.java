package com.worksphere.platform.service;

import com.worksphere.platform.dto.DesignationDto;
import com.worksphere.platform.dto.Mapper;
import com.worksphere.platform.entity.Department;
import com.worksphere.platform.entity.Designation;
import com.worksphere.platform.exception.BadRequestException;
import com.worksphere.platform.exception.ResourceNotFoundException;
import com.worksphere.platform.repository.DepartmentRepository;
import com.worksphere.platform.repository.DesignationRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class DesignationService {

    private final DesignationRepository designationRepository;
    private final DepartmentRepository departmentRepository;
    private final AuditLogService auditLogService;

    public DesignationService(DesignationRepository designationRepository,
                              DepartmentRepository departmentRepository,
                              AuditLogService auditLogService) {
        this.designationRepository = designationRepository;
        this.departmentRepository = departmentRepository;
        this.auditLogService = auditLogService;
    }

    @Transactional(readOnly = true)
    public List<DesignationDto> getAllDesignations() {
        return designationRepository.findAll().stream()
                .map(Mapper::toDesignationDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<DesignationDto> getDesignationsByDepartment(Long departmentId) {
        return designationRepository.findByDepartmentId(departmentId).stream()
                .map(Mapper::toDesignationDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public DesignationDto getDesignationById(Long id) {
        Designation desig = designationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Designation not found with id: " + id));
        return Mapper.toDesignationDto(desig);
    }

    @Transactional
    public DesignationDto createDesignation(DesignationDto dto, String adminEmail, String ipAddress) {
        Department dept = departmentRepository.findById(dto.getDepartmentId())
                .orElseThrow(() -> new ResourceNotFoundException("Department not found"));

        if (designationRepository.existsByTitleAndDepartmentId(dto.getTitle(), dto.getDepartmentId())) {
            throw new BadRequestException("Designation title already exists in this department");
        }

        Designation desig = Designation.builder()
                .title(dto.getTitle())
                .department(dept)
                .build();

        Designation saved = designationRepository.save(desig);
        auditLogService.log(adminEmail, "DESIGNATION_CREATION", "Created designation: " + saved.getTitle() + " under " + dept.getName(), ipAddress);
        return Mapper.toDesignationDto(saved);
    }

    @Transactional
    public DesignationDto updateDesignation(Long id, DesignationDto dto, String adminEmail, String ipAddress) {
        Designation desig = designationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Designation not found"));

        Department dept = departmentRepository.findById(dto.getDepartmentId())
                .orElseThrow(() -> new ResourceNotFoundException("Department not found"));

        if (!desig.getTitle().equals(dto.getTitle()) && 
                designationRepository.existsByTitleAndDepartmentId(dto.getTitle(), dto.getDepartmentId())) {
            throw new BadRequestException("Designation title already exists in this department");
        }

        desig.setTitle(dto.getTitle());
        desig.setDepartment(dept);

        Designation saved = designationRepository.save(desig);
        auditLogService.log(adminEmail, "DESIGNATION_UPDATE", "Updated designation: " + saved.getTitle(), ipAddress);
        return Mapper.toDesignationDto(saved);
    }

    @Transactional
    public void deleteDesignation(Long id, String adminEmail, String ipAddress) {
        Designation desig = designationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Designation not found"));
        designationRepository.delete(desig);
        auditLogService.log(adminEmail, "DESIGNATION_DELETION", "Deleted designation: " + desig.getTitle(), ipAddress);
    }
}
