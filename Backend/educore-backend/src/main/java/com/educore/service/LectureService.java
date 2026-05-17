package com.educore.service;

import com.educore.dto.LectureRequestDTO;
import com.educore.dto.LectureResponseDTO;
import com.educore.entity.Course;
import com.educore.entity.Lecture;
import com.educore.repository.CourseRepository;
import com.educore.repository.LectureRepository;
import java.time.LocalDateTime;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class LectureService {

    private final LectureRepository lectureRepository;
    private final CourseRepository courseRepository;

    public LectureResponseDTO createLecture(
            Long courseId,
            LectureRequestDTO lectureRequestDTO
    ) {

        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found"));

        Lecture lecture = new Lecture();

        lecture.setTitle(lectureRequestDTO.getTitle());
        lecture.setVideoUrl(lectureRequestDTO.getVideoUrl());
        lecture.setPdfUrl(lectureRequestDTO.getPdfUrl());

        lecture.setCourse(course);

        lecture.setCreatedAt(LocalDateTime.now());

        Lecture savedLecture = lectureRepository.save(lecture);

        return mapToResponseDTO(savedLecture);
    }

    public List<LectureResponseDTO> getLecturesByCourse(Long courseId) {

        courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found"));

        return lectureRepository.findByCourseId(courseId)
                .stream()
                .map(this::mapToResponseDTO)
                .toList();
    }

    private LectureResponseDTO mapToResponseDTO(Lecture lecture) {

        return new LectureResponseDTO(
                lecture.getId(),
                lecture.getTitle(),
                lecture.getVideoUrl(),
                lecture.getPdfUrl(),
                lecture.getCreatedAt()
        );
    }
}