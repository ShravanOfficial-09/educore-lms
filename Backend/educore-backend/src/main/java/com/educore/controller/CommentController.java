package com.educore.controller;

import com.educore.common.ApiResponse;
import com.educore.dto.CommentRequestDTO;
import com.educore.dto.CommentResponseDTO;
import com.educore.service.CommentService;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/comments")
@RequiredArgsConstructor
public class CommentController {

    private final CommentService commentService;

    @PostMapping("/create/{lectureId}")
    public ResponseEntity<ApiResponse> createComment(
            @PathVariable Long lectureId,
            @Valid @RequestBody CommentRequestDTO request,
            Authentication authentication
    ) {
        if (authentication == null || authentication.getName() == null) {
            throw new RuntimeException("Unauthorized");
        }

        CommentResponseDTO comment = commentService.createComment(
                lectureId,
                authentication.getName(),
                request
        );

        return ResponseEntity.ok(
                new ApiResponse(true, "Comment added successfully", comment)
        );
    }

    @GetMapping("/lecture/{lectureId}")
    public ResponseEntity<ApiResponse> getCommentsByLecture(
            @PathVariable Long lectureId,
            Authentication authentication
    ) {
        if (authentication == null || authentication.getName() == null) {
            throw new RuntimeException("Unauthorized");
        }

        List<CommentResponseDTO> comments = commentService.getCommentsByLecture(lectureId);

        return ResponseEntity.ok(
                new ApiResponse(true, "Lecture comments fetched successfully", comments)
        );
    }
}
