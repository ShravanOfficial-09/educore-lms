package com.educore.controller;

import com.educore.common.ApiResponse;
import com.educore.dto.ResourceRequestDTO;
import com.educore.dto.ResourceResponseDTO;
import com.educore.service.ResourceService;
import jakarta.validation.Valid;
import java.util.List;
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
@RequestMapping("/api/resources")
@RequiredArgsConstructor
public class ResourceController {

    private final ResourceService resourceService;

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/upload/{lectureId}")
    public ResponseEntity<ApiResponse> uploadResource(
            @PathVariable Long lectureId,
            @Valid @RequestBody ResourceRequestDTO request
    ) {
        ResourceResponseDTO resource = resourceService.uploadResource(lectureId, request);

        return ResponseEntity.ok(
                new ApiResponse(true, "Resource uploaded successfully", resource)
        );
    }

    @PreAuthorize("hasAnyRole('ADMIN','STUDENT')")
    @GetMapping("/lecture/{lectureId}")
    public ResponseEntity<ApiResponse> getLectureResources(@PathVariable Long lectureId) {
        List<ResourceResponseDTO> resources = resourceService.getLectureResources(lectureId);

        return ResponseEntity.ok(
                new ApiResponse(true, "Lecture resources fetched successfully", resources)
        );
    }
}
