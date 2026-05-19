package com.educore.controller;

import com.educore.common.ApiResponse;
import com.educore.service.CertificateService;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/certificates")
@RequiredArgsConstructor
public class CertificateController {

    private final CertificateService certificateService;

    @PreAuthorize("hasRole('STUDENT')")
    @GetMapping("/course/{courseId}")
    public ResponseEntity<ApiResponse> getCourseCertificate(
            @PathVariable Long courseId,
            Authentication authentication
    ) {
        if (authentication == null || authentication.getName() == null) {
            throw new RuntimeException("Unauthorized");
        }

        Map<String, Object> certificateData =
                certificateService.getCourseCertificate(authentication.getName(), courseId);

        return ResponseEntity.ok(
                new ApiResponse(true, "Course certificate fetched successfully", certificateData)
        );
    }
}
