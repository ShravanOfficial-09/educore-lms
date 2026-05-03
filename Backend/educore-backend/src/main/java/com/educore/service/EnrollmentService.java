package com.educore.service;

import com.educore.entity.Enrollment;
import com.educore.repository.EnrollmentRepository;
import java.time.LocalDateTime;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EnrollmentService {

    private final EnrollmentRepository enrollmentRepository;

    public Enrollment enrollUser(String email, Long courseId) {
        if (enrollmentRepository.existsByUserEmailAndCourseId(email, courseId)) {
            throw new RuntimeException("User is already enrolled in this course");
        }

        Enrollment enrollment = new Enrollment();
        enrollment.setUserEmail(email);
        enrollment.setCourseId(courseId);
        enrollment.setEnrolledAt(LocalDateTime.now());

        return enrollmentRepository.save(enrollment);
    }
}
