package com.educore.service;

import com.educore.entity.Course;
import com.educore.entity.Enrollment;
import com.educore.repository.CourseRepository;
import com.educore.repository.EnrollmentRepository;
import java.time.LocalDateTime;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EnrollmentService {

    private final EnrollmentRepository enrollmentRepository;

    private final CourseRepository courseRepository;

    public Map<String, Object> enrollUser(
            String email,
            Long courseId
    ) {

        Course course = courseRepository.findById(courseId)
                .orElseThrow(() ->
                        new RuntimeException("Course not found"));

        if (enrollmentRepository.existsByUserEmailAndCourseId(email, courseId)) {

            throw new RuntimeException(
                    "User is already enrolled in this course"
            );
        }

        Enrollment enrollment = new Enrollment();

        enrollment.setUserEmail(email);

        enrollment.setCourseId(course.getId());

        enrollment.setEnrolledAt(LocalDateTime.now());

        enrollmentRepository.save(enrollment);

        return Map.of(
                "courseId", course.getId(),
                "userEmail", email,
                "enrolled", true
        );
    }

    public boolean isUserEnrolled(
            String email,
            Long courseId
    ) {

        courseRepository.findById(courseId)
                .orElseThrow(() ->
                        new RuntimeException("Course not found"));

        return enrollmentRepository.existsByUserEmailAndCourseId(
                email,
                courseId
        );
    }
}