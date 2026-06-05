package com.worksphere.platform.repository;

import com.worksphere.platform.entity.Attendance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface AttendanceRepository extends JpaRepository<Attendance, Long> {
    Optional<Attendance> findByEmployeeIdAndDate(Long employeeId, LocalDate date);
    List<Attendance> findByEmployeeIdAndDateBetween(Long employeeId, LocalDate startDate, LocalDate endDate);
    List<Attendance> findByDate(LocalDate date);
    
    @Query("SELECT COUNT(a) FROM Attendance a WHERE a.date = :date AND a.status IN ('PRESENT', 'LATE')")
    long countPresentByDate(@Param("date") LocalDate date);
    
    @Query("SELECT COUNT(a) FROM Attendance a WHERE a.date = :date")
    long countTotalByDate(@Param("date") LocalDate date);
}
