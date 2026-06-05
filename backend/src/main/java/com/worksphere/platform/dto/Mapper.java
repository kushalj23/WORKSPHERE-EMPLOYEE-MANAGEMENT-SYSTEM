package com.worksphere.platform.dto;

import com.worksphere.platform.entity.*;
import java.util.Map;

public class Mapper {

    public static EmployeeDto toEmployeeDto(Employee emp) {
        if (emp == null) return null;
        return EmployeeDto.builder()
                .id(emp.getId())
                .employeeCode(emp.getEmployeeCode())
                .firstName(emp.getFirstName())
                .lastName(emp.getLastName())
                .email(emp.getEmail())
                .phoneNumber(emp.getPhoneNumber())
                .gender(emp.getGender())
                .dateOfBirth(emp.getDateOfBirth())
                .address(emp.getAddress())
                .departmentId(emp.getDepartment() != null ? emp.getDepartment().getId() : null)
                .departmentName(emp.getDepartment() != null ? emp.getDepartment().getName() : null)
                .designationId(emp.getDesignation() != null ? emp.getDesignation().getId() : null)
                .designationTitle(emp.getDesignation() != null ? emp.getDesignation().getTitle() : null)
                .salary(emp.getSalary())
                .joiningDate(emp.getJoiningDate())
                .employmentType(emp.getEmploymentType())
                .employmentStatus(emp.getEmploymentStatus())
                .emergencyContact(emp.getEmergencyContact())
                .profileImage(emp.getProfileImage())
                .createdAt(emp.getCreatedAt())
                .updatedAt(emp.getUpdatedAt())
                .build();
    }

    public static DepartmentDto toDepartmentDto(Department dept) {
        if (dept == null) return null;
        return DepartmentDto.builder()
                .id(dept.getId())
                .name(dept.getName())
                .description(dept.getDescription())
                .managerId(dept.getManager() != null ? dept.getManager().getId() : null)
                .managerName(dept.getManager() != null ? (dept.getManager().getFirstName() + " " + dept.getManager().getLastName()) : null)
                .createdAt(dept.getCreatedAt())
                .updatedAt(dept.getUpdatedAt())
                .build();
    }

    public static DepartmentDto toDepartmentDto(Department dept, Long employeeCount) {
        DepartmentDto dto = toDepartmentDto(dept);
        if (dto != null) {
            dto.setEmployeeCount(employeeCount);
        }
        return dto;
    }

    public static DesignationDto toDesignationDto(Designation desig) {
        if (desig == null) return null;
        return DesignationDto.builder()
                .id(desig.getId())
                .title(desig.getTitle())
                .departmentId(desig.getDepartment() != null ? desig.getDepartment().getId() : null)
                .departmentName(desig.getDepartment() != null ? desig.getDepartment().getName() : null)
                .createdAt(desig.getCreatedAt())
                .updatedAt(desig.getUpdatedAt())
                .build();
    }

    public static AttendanceDto toAttendanceDto(Attendance att) {
        if (att == null) return null;
        return AttendanceDto.builder()
                .id(att.getId())
                .employeeId(att.getEmployee() != null ? att.getEmployee().getId() : null)
                .employeeCode(att.getEmployee() != null ? att.getEmployee().getEmployeeCode() : null)
                .employeeName(att.getEmployee() != null ? (att.getEmployee().getFirstName() + " " + att.getEmployee().getLastName()) : null)
                .date(att.getDate())
                .clockIn(att.getClockIn())
                .clockOut(att.getClockOut())
                .status(att.getStatus())
                .createdAt(att.getCreatedAt())
                .updatedAt(att.getUpdatedAt())
                .build();
    }

    public static LeaveRequestDto toLeaveRequestDto(LeaveRequest lr) {
        if (lr == null) return null;
        return LeaveRequestDto.builder()
                .id(lr.getId())
                .employeeId(lr.getEmployee() != null ? lr.getEmployee().getId() : null)
                .employeeCode(lr.getEmployee() != null ? lr.getEmployee().getEmployeeCode() : null)
                .employeeName(lr.getEmployee() != null ? (lr.getEmployee().getFirstName() + " " + lr.getEmployee().getLastName()) : null)
                .leaveType(lr.getLeaveType())
                .startDate(lr.getStartDate())
                .endDate(lr.getEndDate())
                .reason(lr.getReason())
                .status(lr.getStatus())
                .approvedById(lr.getApprovedBy() != null ? lr.getApprovedBy().getId() : null)
                .approvedByName(lr.getApprovedBy() != null ? (lr.getApprovedBy().getFirstName() + " " + lr.getApprovedBy().getLastName()) : null)
                .comments(lr.getComments())
                .createdAt(lr.getCreatedAt())
                .updatedAt(lr.getUpdatedAt())
                .build();
    }

    public static AuditLogDto toAuditLogDto(AuditLog log) {
        if (log == null) return null;
        return AuditLogDto.builder()
                .id(log.getId())
                .userId(log.getUser() != null ? log.getUser().getId() : null)
                .userEmail(log.getUser() != null ? log.getUser().getEmail() : null)
                .action(log.getAction())
                .details(log.getDetails())
                .ipAddress(log.getIpAddress())
                .timestamp(log.getTimestamp())
                .build();
    }
}
