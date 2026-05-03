package com.educore.service;

import com.educore.dto.CourseRequestDTO;
import com.educore.dto.CourseResponseDTO;
import com.educore.entity.Course;
import com.educore.repository.CourseRepository;
import com.educore.repository.EnrollmentRepository;
import java.time.LocalDateTime;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CourseService {

    private final CourseRepository courseRepository;
    private final EnrollmentRepository enrollmentRepository;

    public Course createCourse(CourseRequestDTO courseRequestDTO) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || authentication.getName() == null) {
            throw new RuntimeException("Unauthorized");
        }

        Course course = new Course();
        course.setTitle(courseRequestDTO.getTitle());
        course.setDescription(courseRequestDTO.getDescription());
        course.setPrice(courseRequestDTO.getPrice());
        course.setCreatedBy(authentication.getName());
        course.setCreatedAt(LocalDateTime.now());

        return courseRepository.save(course);
    }

    public List<Course> getAllCourses() {
        return courseRepository.findAll();
    }

    public CourseResponseDTO getCourseByIdForCurrentUser(Long courseId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || authentication.getName() == null) {
            throw new RuntimeException("Unauthorized");
        }

        String email = authentication.getName();
        if (!enrollmentRepository.existsByUserEmailAndCourseId(email, courseId)) {
            throw new RuntimeException("Access Denied");
        }

        Course course = courseRepository.findById(courseId)
            .orElseThrow(() -> new RuntimeException("Course not found"));

        return new CourseResponseDTO(
            course.getId(),
            course.getTitle(),
            course.getDescription(),
            course.getPrice(),
            course.getCreatedBy()
        );
    }
}
