package com.educore.controller;

import com.educore.common.ApiResponse;
import com.educore.service.HealthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/health")
@RequiredArgsConstructor
public class HealthController {

    private final HealthService healthService;

    @GetMapping
    public ResponseEntity<ApiResponse> health() {
        String healthStatus = healthService.getHealthStatus();
        return ResponseEntity.ok(new ApiResponse(true, "Health fetched successfully", healthStatus));
    }
}
