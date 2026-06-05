package com.worksphere.platform.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LeaveRequestDto {
    private Long id;
    private Long employeeId;
    private String employeeCode;
    private String employeeName;
    private String leaveType; // SICK, CASUAL, ANNUAL, MATERNITY
    private LocalDate startDate;
    private LocalDate endDate;
    private String reason;
    private String status; // PENDING, APPROVED, REJECTED
    private Long approvedById;
    private String approvedByName;
    private String comments;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
