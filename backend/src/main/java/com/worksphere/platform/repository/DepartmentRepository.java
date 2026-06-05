package com.worksphere.platform.repository;

import com.worksphere.platform.entity.Department;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Repository
public interface DepartmentRepository extends JpaRepository<Department, Long> {
    Optional<Department> findByName(String name);
    boolean existsByName(String name);
    
    @Query("SELECT d.name as name, COUNT(e) as count FROM Employee e JOIN e.department d GROUP BY d.name")
    List<Map<String, Object>> getDepartmentEmployeeDistribution();
}
