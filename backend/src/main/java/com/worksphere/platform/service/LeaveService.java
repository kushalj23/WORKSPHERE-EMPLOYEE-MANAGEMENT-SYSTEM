package com.worksphere.platform.service;

import com.worksphere.platform.dto.LeaveRequestDto;
import com.worksphere.platform.dto.Mapper;
import com.worksphere.platform.entity.Employee;
import com.worksphere.platform.entity.LeaveRequest;
import com.worksphere.platform.exception.BadRequestException;
import com.worksphere.platform.exception.ResourceNotFoundException;
import com.worksphere.platform.repository.EmployeeRepository;
import com.worksphere.platform.repository.LeaveRequestRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class LeaveService {

    private final LeaveRequestRepository leaveRequestRepository;
    private final EmployeeRepository employeeRepository;
    private final AuditLogService auditLogService;

    public LeaveService(LeaveRequestRepository leaveRequestRepository,
                        EmployeeRepository employeeRepository,
                        AuditLogService auditLogService) {
        this.leaveRequestRepository = leaveRequestRepository;
        this.employeeRepository = employeeRepository;
        this.auditLogService = auditLogService;
    }

    @Transactional
    public LeaveRequestDto applyLeave(LeaveRequestDto dto, String email, String ipAddress) {
        Employee emp = employeeRepository.findById(dto.getEmployeeId())
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found"));

        if (dto.getStartDate().isAfter(dto.getEndDate())) {
            throw new BadRequestException("Start date cannot be after end date");
        }

        LeaveRequest lr = LeaveRequest.builder()
                .employee(emp)
                .leaveType(dto.getLeaveType())
                .startDate(dto.getStartDate())
                .endDate(dto.getEndDate())
                .reason(dto.getReason())
                .status("PENDING")
                .build();

        LeaveRequest saved = leaveRequestRepository.save(lr);
        auditLogService.log(email, "LEAVE_APPLY", "Employee applied for leave type: " + dto.getLeaveType(), ipAddress);
        return Mapper.toLeaveRequestDto(saved);
    }

    @Transactional
    public LeaveRequestDto approveOrRejectLeave(Long id, String status, String comments, Long approverEmployeeId, String approverEmail, String ipAddress) {
        LeaveRequest lr = leaveRequestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Leave request not found"));

        if (!lr.getStatus().equals("PENDING")) {
            throw new BadRequestException("Leave request is already processed!");
        }

        Employee approver = employeeRepository.findById(approverEmployeeId)
                .orElseThrow(() -> new ResourceNotFoundException("Approver employee not found"));

        lr.setStatus(status);
        lr.setComments(comments);
        lr.setApprovedBy(approver);

        LeaveRequest saved = leaveRequestRepository.save(lr);
        auditLogService.log(approverEmail, "LEAVE_DECISION", "Leave request #" + id + " has been " + status, ipAddress);
        return Mapper.toLeaveRequestDto(saved);
    }

    @Transactional(readOnly = true)
    public List<LeaveRequestDto> getAllLeaveRequests() {
        return leaveRequestRepository.findAll().stream()
                .map(Mapper::toLeaveRequestDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<LeaveRequestDto> getEmployeeLeaveHistory(Long employeeId) {
        return leaveRequestRepository.findByEmployeeId(employeeId).stream()
                .map(Mapper::toLeaveRequestDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getLeaveBalance(Long employeeId) {
        Map<String, Object> balances = new HashMap<>();
        
        long annualUsed = leaveRequestRepository.countApprovedLeavesByEmployeeAndType(employeeId, "ANNUAL");
        long casualUsed = leaveRequestRepository.countApprovedLeavesByEmployeeAndType(employeeId, "CASUAL");
        long sickUsed = leaveRequestRepository.countApprovedLeavesByEmployeeAndType(employeeId, "SICK");
        long maternityUsed = leaveRequestRepository.countApprovedLeavesByEmployeeAndType(employeeId, "MATERNITY");

        balances.put("annualLimit", 15);
        balances.put("annualUsed", annualUsed);
        balances.put("annualRemaining", Math.max(0, 15 - annualUsed));

        balances.put("casualLimit", 10);
        balances.put("casualUsed", casualUsed);
        balances.put("casualRemaining", Math.max(0, 10 - casualUsed));

        balances.put("sickLimit", 12);
        balances.put("sickUsed", sickUsed);
        balances.put("sickRemaining", Math.max(0, 12 - sickUsed));

        balances.put("maternityLimit", 90);
        balances.put("maternityUsed", maternityUsed);
        balances.put("maternityRemaining", Math.max(0, 90 - maternityUsed));

        return balances;
    }
}
