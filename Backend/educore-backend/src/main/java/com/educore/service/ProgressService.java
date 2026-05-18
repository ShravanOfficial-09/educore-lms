package com.educore.service;

import com.educore.entity.Course;
import com.educore.entity.Lecture;
import com.educore.entity.Progress;
import com.educore.repository.CourseRepository;
import com.educore.repository.EnrollmentRepository;
import com.educore.repository.LectureRepository;
import com.educore.repository.ProgressRepository;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ProgressService {

    private final ProgressRepository progressRepository;

    private final LectureRepository lectureRepository;

    private final EnrollmentRepository enrollmentRepository;

    private final CourseRepository courseRepository;

    public Map<String, Object> markLectureCompleted(
            String userEmail,
            Long lectureId
    ) {

        Lecture lecture = lectureRepository.findById(lectureId)
                .orElseThrow(() ->
                        new RuntimeException("Lecture not found"));

        Long courseId = lecture.getCourse().getId();

        if (!enrollmentRepository.existsByUserEmailAndCourseId(
                userEmail,
                courseId
        )) {

            throw new RuntimeException(
                    "User is not enrolled in this course"
            );
        }

        if (progressRepository.existsByUserEmailAndLectureId(
                userEmail,
                lectureId
        )) {

            throw new RuntimeException(
                    "Lecture already marked as completed"
            );
        }

        Progress progress = new Progress();

        progress.setUserEmail(userEmail);

        progress.setLecture(lecture);

        progress.setCompleted(true);

        progress.setCompletedAt(LocalDateTime.now());

        progressRepository.save(progress);

        return Map.of(
                "lectureId", lectureId,
                "completed", true
        );
    }

    public Map<String, Object> getCourseProgress(
            String userEmail,
            Long courseId
    ) {

        Course course = courseRepository.findById(courseId)
                .orElseThrow(() ->
                        new RuntimeException("Course not found"));

        if (!enrollmentRepository.existsByUserEmailAndCourseId(
                userEmail,
                courseId
        )) {

            throw new RuntimeException(
                    "User is not enrolled in this course"
            );
        }

        List<Lecture> courseLectures =
                lectureRepository.findByCourseId(course.getId());

        List<Progress> completedProgressList =
                progressRepository
                        .findByUserEmailAndLectureCourseIdAndCompletedTrue(
                                userEmail,
                                courseId
                        );

        int totalLectures = courseLectures.size();

        int completedLectures = completedProgressList.size();

        double progressPercentage = totalLectures == 0
                ? 0
                : ((double) completedLectures / totalLectures) * 100;

        progressPercentage =
                Math.round(progressPercentage * 100.0) / 100.0;

        List<Long> completedLectureIds =
                completedProgressList.stream()
                        .map(progress ->
                                progress.getLecture().getId())
                        .toList();

        return Map.of(
                "completedLectures", completedLectures,
                "totalLectures", totalLectures,
                "progressPercentage", progressPercentage,
                "completedLectureIds", completedLectureIds
        );
    }
}