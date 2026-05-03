package com.educore.service;

import com.educore.dto.LectureRequestDTO;
import com.educore.dto.LectureResponseDTO;
import com.educore.entity.Lecture;
import com.educore.exception.AccessDeniedException;
import com.educore.repository.EnrollmentRepository;
import com.educore.repository.LectureRepository;
import java.time.LocalDateTime;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class LectureService {

    private final LectureRepository lectureRepository;
    private final EnrollmentRepository enrollmentRepository;

    public LectureResponseDTO addLecture(LectureRequestDTO lectureRequestDTO) {
        Lecture lecture = new Lecture();
        lecture.setTitle(lectureRequestDTO.getTitle());
        lecture.setVideoUrl(lectureRequestDTO.getVideoUrl());
        lecture.setPdfUrl(lectureRequestDTO.getPdfUrl());
        lecture.setCourseId(lectureRequestDTO.getCourseId());
        lecture.setCreatedAt(LocalDateTime.now());

        Lecture savedLecture = lectureRepository.save(lecture);
        return mapToResponseDTO(savedLecture);
    }

    public List<LectureResponseDTO> getLecturesByCourse(Long courseId, String userEmail) {

        boolean isEnrolled = enrollmentRepository
                .existsByUserEmailAndCourseId(userEmail, courseId);

        if (!isEnrolled) {
            throw new AccessDeniedException("Not enrolled in this course");
        }

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
