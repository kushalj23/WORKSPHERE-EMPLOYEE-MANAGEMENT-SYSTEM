package com.worksphere.platform.repository;

import com.worksphere.platform.entity.Employee;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface EmployeeRepository extends JpaRepository<Employee, Long>, JpaSpecificationExecutor<Employee> {
    Optional<Employee> findByEmail(String email);
    Optional<Employee> findByEmployeeCode(String employeeCode);
    boolean existsByEmail(String email);
    boolean existsByEmployeeCode(String employeeCode);
    
    @Query("SELECT COUNT(e) FROM Employee e WHERE e.employmentStatus = 'ACTIVE'")
    long countActiveEmployees();

    @Query("SELECT COUNT(e) FROM Employee e WHERE EXTRACT(MONTH FROM e.joiningDate) = EXTRACT(MONTH FROM CURRENT_DATE) AND EXTRACT(YEAR FROM e.joiningDate) = EXTRACT(YEAR FROM CURRENT_DATE)")
    long countNewEmployeesThisMonth();

    @Query("SELECT e FROM Employee e WHERE EXTRACT(MONTH FROM e.dateOfBirth) = EXTRACT(MONTH FROM CURRENT_DATE)")
    List<Employee> findEmployeesWithBirthdayThisMonth();
    
    @Query("SELECT e FROM Employee e WHERE EXTRACT(MONTH FROM e.joiningDate) = EXTRACT(MONTH FROM CURRENT_DATE)")
    List<Employee> findEmployeesWithAnniversaryThisMonth();
}
