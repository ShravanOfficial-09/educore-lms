package com.educore.repository;

import com.educore.entity.Lecture;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface LectureRepository extends JpaRepository<Lecture, Long> {

    List<Lecture> findByCourseId(Long courseId);
}
