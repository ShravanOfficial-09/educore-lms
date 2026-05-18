package com.educore.controller;

import com.educore.common.ApiResponse;
import com.educore.service.EnrollmentService;
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
@RequestMapping("/api/enrollments")
@RequiredArgsConstructor
public class EnrollmentController {

    private final EnrollmentService enrollmentService;

    @PreAuthorize("hasRole('STUDENT')")
    @PostMapping("/enroll/{courseId}")
    public ResponseEntity<ApiResponse> enrollInCourse(
            @PathVariable Long courseId,
            Authentication authentication
    ) {

        if (authentication == null
                || authentication.getName() == null) {

            throw new RuntimeException("Unauthorized");
        }

        Map<String, Object> enrollmentResponse =
                enrollmentService.enrollUser(
                        authentication.getName(),
                        courseId
                );

        return ResponseEntity.ok(
                new ApiResponse(
                        true,
                        "Enrollment successful",
                        enrollmentResponse
                )
        );
    }

    @PreAuthorize("hasRole('STUDENT')")
    @GetMapping("/check/{courseId}")
    public ResponseEntity<ApiResponse> checkEnrollment(
            @PathVariable Long courseId,
            Authentication authentication
    ) {

        if (authentication == null
                || authentication.getName() == null) {

            throw new RuntimeException("Unauthorized");
        }

        boolean enrolled =
                enrollmentService.isUserEnrolled(
                        authentication.getName(),
                        courseId
                );

        return ResponseEntity.ok(
                new ApiResponse(
                        true,
                        "Enrollment status fetched successfully",
                        Map.of("enrolled", enrolled)
                )
        );
    }
}