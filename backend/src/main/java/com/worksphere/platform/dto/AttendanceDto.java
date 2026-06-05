package com.worksphere.platform.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AttendanceDto {
    private Long id;
    private Long employeeId;
    private String employeeCode;
    private String employeeName;
    private LocalDate date;
    private Instant clockIn;
    private Instant clockOut;
    private String status; // PRESENT, ABSENT, LATE, HALF_DAY
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
