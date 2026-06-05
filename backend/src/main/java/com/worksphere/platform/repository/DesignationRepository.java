package com.worksphere.platform.repository;

import com.worksphere.platform.entity.Designation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface DesignationRepository extends JpaRepository<Designation, Long> {
    List<Designation> findByDepartmentId(Long departmentId);
    Optional<Designation> findByTitleAndDepartmentId(String title, Long departmentId);
    boolean existsByTitleAndDepartmentId(String title, Long departmentId);
}
