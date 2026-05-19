package com.educore.service;

import com.educore.dto.CommentRequestDTO;
import com.educore.dto.CommentResponseDTO;
import com.educore.entity.Comment;
import com.educore.entity.Lecture;
import com.educore.repository.CommentRepository;
import com.educore.repository.LectureRepository;
import java.time.LocalDateTime;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CommentService {

    private final CommentRepository commentRepository;
    private final LectureRepository lectureRepository;

    public CommentResponseDTO createComment(Long lectureId, String userEmail, CommentRequestDTO request) {
        Lecture lecture = lectureRepository.findById(lectureId)
                .orElseThrow(() -> new RuntimeException("Lecture not found"));

        Comment comment = new Comment();
        comment.setMessage(request.getMessage());
        comment.setUserEmail(userEmail);
        comment.setLecture(lecture);
        comment.setCreatedAt(LocalDateTime.now());

        Comment savedComment = commentRepository.save(comment);
        return mapToResponseDTO(savedComment);
    }

    public List<CommentResponseDTO> getCommentsByLecture(Long lectureId) {
        lectureRepository.findById(lectureId)
                .orElseThrow(() -> new RuntimeException("Lecture not found"));

        return commentRepository.findByLecture_IdOrderByCreatedAtDesc(lectureId)
                .stream()
                .map(this::mapToResponseDTO)
                .toList();
    }

    private CommentResponseDTO mapToResponseDTO(Comment comment) {
        return new CommentResponseDTO(
                comment.getId(),
                comment.getMessage(),
                comment.getUserEmail(),
                comment.getLecture().getId(),
                comment.getCreatedAt()
        );
    }
}
