package com.worksphere.platform.repository;

import com.worksphere.platform.entity.LeaveRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface LeaveRequestRepository extends JpaRepository<LeaveRequest, Long> {
    List<LeaveRequest> findByEmployeeId(Long employeeId);
    List<LeaveRequest> findByStatus(String status);
    
    @Query("SELECT COUNT(l) FROM LeaveRequest l WHERE l.status = 'PENDING'")
    long countPendingLeaves();

    @Query("SELECT COUNT(l) FROM LeaveRequest l WHERE l.employee.id = :employeeId AND l.status = 'APPROVED' AND l.leaveType = :leaveType")
    long countApprovedLeavesByEmployeeAndType(@Param("employeeId") Long employeeId, @Param("leaveType") String leaveType);
}
