package com.educore.repository;

import com.educore.entity.Enrollment;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EnrollmentRepository extends JpaRepository<Enrollment, Long> {

    List<Enrollment> findByUserEmail(String email);

    boolean existsByUserEmailAndCourseId(String email, Long courseId);
}
