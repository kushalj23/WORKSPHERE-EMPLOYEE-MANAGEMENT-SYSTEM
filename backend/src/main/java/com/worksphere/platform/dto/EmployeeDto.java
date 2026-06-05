package com.worksphere.platform.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EmployeeDto {
    private Long id;
    private String employeeCode;
    private String firstName;
    private String lastName;
    private String email;
    private String phoneNumber;
    private String gender;
    private LocalDate dateOfBirth;
    private String address;
    private Long departmentId;
    private String departmentName;
    private Long designationId;
    private String designationTitle;
    private BigDecimal salary;
    private LocalDate joiningDate;
    private String employmentType; // FULL_TIME, PART_TIME, CONTRACT, INTERN
    private String employmentStatus; // ACTIVE, INACTIVE, SUSPENDED, TERMINATED
    private String emergencyContact;
    private String profileImage;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
