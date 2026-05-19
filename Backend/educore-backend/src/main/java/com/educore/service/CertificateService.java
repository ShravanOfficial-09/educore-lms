package com.educore.service;

import com.educore.entity.Course;
import com.educore.entity.Progress;
import com.educore.entity.User;
import com.educore.repository.CourseRepository;
import com.educore.repository.EnrollmentRepository;
import com.educore.repository.ProgressRepository;
import com.educore.repository.UserRepository;
import java.util.LinkedHashMap;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CertificateService {

    private final ProgressService progressService;
    private final UserRepository userRepository;
    private final CourseRepository courseRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final ProgressRepository progressRepository;

    public Map<String, Object> getCourseCertificate(String userEmail, Long courseId) {
        User student = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!"STUDENT".equals(student.getRole().name())) {
            throw new AccessDeniedException("Only students can access course certificates");
        }

        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found"));

        if (!enrollmentRepository.existsByUserEmailAndCourseId(userEmail, courseId)) {
            throw new RuntimeException("User is not enrolled in this course");
        }

        Map<String, Object> progressData = progressService.getCourseProgress(userEmail, courseId);
        double progressPercentage = ((Number) progressData.get("progressPercentage")).doubleValue();
        boolean eligible = Double.compare(progressPercentage, 100.0) == 0;

        List<Progress> completedProgressList =
                progressRepository.findByUserEmailAndLectureCourseIdAndCompletedTrue(userEmail, courseId);

        LocalDateTime completionDate = null;

        if (eligible && !completedProgressList.isEmpty()) {
            completionDate = completedProgressList.stream()
                    .map(Progress::getCompletedAt)
                    .max(LocalDateTime::compareTo)
                    .orElse(null);
        }

        Map<String, Object> certificateData = new LinkedHashMap<>();
        certificateData.put("eligible", eligible);
        certificateData.put("studentName", student.getName());
        certificateData.put("courseTitle", course.getTitle());
        certificateData.put("completionDate", completionDate);

        return certificateData;
    }
}
