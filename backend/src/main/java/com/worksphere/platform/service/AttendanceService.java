package com.worksphere.platform.service;

import com.worksphere.platform.dto.AttendanceDto;
import com.worksphere.platform.dto.Mapper;
import com.worksphere.platform.entity.Attendance;
import com.worksphere.platform.entity.Employee;
import com.worksphere.platform.exception.BadRequestException;
import com.worksphere.platform.exception.ResourceNotFoundException;
import com.worksphere.platform.repository.AttendanceRepository;
import com.worksphere.platform.repository.EmployeeRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.*;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class AttendanceService {

    private final AttendanceRepository attendanceRepository;
    private final EmployeeRepository employeeRepository;
    private final AuditLogService auditLogService;

    public AttendanceService(AttendanceRepository attendanceRepository,
                             EmployeeRepository employeeRepository,
                             AuditLogService auditLogService) {
        this.attendanceRepository = attendanceRepository;
        this.employeeRepository = employeeRepository;
        this.auditLogService = auditLogService;
    }

    @Transactional
    public AttendanceDto clockIn(Long employeeId, String email, String ipAddress) {
        Employee emp = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found"));

        LocalDate today = LocalDate.now();
        Optional<Attendance> existing = attendanceRepository.findByEmployeeIdAndDate(employeeId, today);
        if (existing.isPresent()) {
            throw new BadRequestException("Already clocked in for today!");
        }

        Instant now = Instant.now();
        LocalTime localTime = LocalTime.now(ZoneId.systemDefault());
        String status = "PRESENT";
        if (localTime.isAfter(LocalTime.of(9, 15))) {
            status = "LATE";
        }

        Attendance attendance = Attendance.builder()
                .employee(emp)
                .date(today)
                .clockIn(now)
                .status(status)
                .build();

        Attendance saved = attendanceRepository.save(attendance);
        auditLogService.log(email, "ATTENDANCE_CLOCK_IN", "Employee clocked in. Status: " + status, ipAddress);
        return Mapper.toAttendanceDto(saved);
    }

    @Transactional
    public AttendanceDto clockOut(Long employeeId, String email, String ipAddress) {
        LocalDate today = LocalDate.now();
        Attendance attendance = attendanceRepository.findByEmployeeIdAndDate(employeeId, today)
                .orElseThrow(() -> new BadRequestException("No clock-in record found for today. Please clock in first."));

        if (attendance.getClockOut() != null) {
            throw new BadRequestException("Already clocked out for today!");
        }

        attendance.setClockOut(Instant.now());
        Attendance saved = attendanceRepository.save(attendance);
        auditLogService.log(email, "ATTENDANCE_CLOCK_OUT", "Employee clocked out successfully.", ipAddress);
        return Mapper.toAttendanceDto(saved);
    }

    @Transactional(readOnly = true)
    public List<AttendanceDto> getDailyAttendance(LocalDate date) {
        LocalDate queryDate = date != null ? date : LocalDate.now();
        return attendanceRepository.findByDate(queryDate).stream()
                .map(Mapper::toAttendanceDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<AttendanceDto> getEmployeeHistory(Long employeeId, LocalDate start, LocalDate end) {
        LocalDate startDate = start != null ? start : LocalDate.now().minusDays(30);
        LocalDate endDate = end != null ? end : LocalDate.now();
        return attendanceRepository.findByEmployeeIdAndDateBetween(employeeId, startDate, endDate).stream()
                .map(Mapper::toAttendanceDto)
                .collect(Collectors.toList());
    }
}
