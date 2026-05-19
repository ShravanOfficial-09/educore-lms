package com.educore.controller;

import com.educore.common.ApiResponse;
import com.educore.dto.QuestionRequestDTO;
import com.educore.dto.QuizRequestDTO;
import com.educore.dto.QuizResponseDTO;
import com.educore.dto.QuizSubmissionDTO;
import com.educore.service.QuizService;
import jakarta.validation.Valid;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/quizzes")
@RequiredArgsConstructor
public class QuizController {

    private final QuizService quizService;

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/create/{lectureId}")
    public ResponseEntity<ApiResponse> createQuiz(
        @PathVariable Long lectureId,
        @Valid @RequestBody QuizRequestDTO request
    ) {
        QuizResponseDTO quiz = quizService.createQuiz(lectureId, request);

        return ResponseEntity.ok(
            new ApiResponse(true, "Quiz created successfully", quiz)
        );
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/question/{quizId}")
    public ResponseEntity<ApiResponse> addQuestion(
        @PathVariable Long quizId,
        @Valid @RequestBody QuestionRequestDTO request
    ) {
        QuizResponseDTO quiz = quizService.addQuestion(quizId, request);

        return ResponseEntity.ok(
            new ApiResponse(true, "Question added successfully", quiz)
        );
    }

    @PreAuthorize("hasAnyRole('ADMIN','STUDENT')")
    @GetMapping("/lecture/{lectureId}")
    public ResponseEntity<ApiResponse> getQuizByLecture(@PathVariable Long lectureId) {
        QuizResponseDTO quizData = quizService.getQuizByLecture(lectureId);

        return ResponseEntity.ok(
            new ApiResponse(true, "Quiz fetched successfully", quizData)
        );
    }

    @PreAuthorize("hasRole('STUDENT')")
    @PostMapping("/submit/{quizId}")
    public ResponseEntity<ApiResponse> submitQuiz(
        @PathVariable Long quizId,
        @Valid @RequestBody QuizSubmissionDTO submissionDTO
    ) {
        Map<String, Object> result = quizService.submitQuiz(quizId, submissionDTO);

        return ResponseEntity.ok(
            new ApiResponse(true, "Quiz submitted successfully", result)
        );
    }
}
