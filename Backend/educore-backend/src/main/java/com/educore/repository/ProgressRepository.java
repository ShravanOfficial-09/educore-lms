package com.educore.repository;

import com.educore.entity.Progress;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProgressRepository extends JpaRepository<Progress, Long> {

    boolean existsByUserEmailAndLectureId(
            String userEmail,
            Long lectureId
    );

    List<Progress> findByUserEmailAndLectureCourseIdAndCompletedTrue(
            String userEmail,
            Long courseId
    );
}