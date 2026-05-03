package com.educore.controller;

import com.educore.common.ApiResponse;
import com.educore.service.EnrollmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final EnrollmentService enrollmentService;

    @PostMapping("/enroll/{courseId}")
    public ResponseEntity<ApiResponse> enrollInCourse(@PathVariable Long courseId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || authentication.getName() == null) {
            throw new RuntimeException("Unauthorized");
        }

        enrollmentService.enrollUser(authentication.getName(), courseId);

        return ResponseEntity.ok(new ApiResponse(true, "Enrollment successful", null));
    }
}
