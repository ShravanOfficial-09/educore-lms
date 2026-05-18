package com.educore.controller;

import com.educore.common.ApiResponse;
import com.educore.service.ProgressService;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/progress")
@RequiredArgsConstructor
public class ProgressController {

    private final ProgressService progressService;

    @PreAuthorize("hasRole('STUDENT')")
    @PostMapping("/complete/{lectureId}")
    public ResponseEntity<ApiResponse> markLectureCompleted(
            @PathVariable Long lectureId,
            Authentication authentication
    ) {

        if (authentication == null
                || authentication.getName() == null) {

            throw new RuntimeException("Unauthorized");
        }

        Map<String, Object> completionResponse =
                progressService.markLectureCompleted(
                        authentication.getName(),
                        lectureId
                );

        return ResponseEntity.ok(
                new ApiResponse(
                        true,
                        "Lecture marked as completed",
                        completionResponse
                )
        );
    }

    @PreAuthorize("hasRole('STUDENT')")
    @GetMapping("/course/{courseId}")
    public ResponseEntity<ApiResponse> getCourseProgress(
            @PathVariable Long courseId,
            Authentication authentication
    ) {

        if (authentication == null
                || authentication.getName() == null) {

            throw new RuntimeException("Unauthorized");
        }

        Map<String, Object> progressData =
                progressService.getCourseProgress(
                        authentication.getName(),
                        courseId
                );

        return ResponseEntity.ok(
                new ApiResponse(
                        true,
                        "Course progress fetched successfully",
                        progressData
                )
        );
    }
}