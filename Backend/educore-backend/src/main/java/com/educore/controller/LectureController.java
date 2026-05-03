package com.educore.controller;

import com.educore.common.ApiResponse;
import com.educore.dto.LectureRequestDTO;
import com.educore.dto.LectureResponseDTO;
import com.educore.service.FileStorageService;
import com.educore.service.LectureService;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/lectures")
@RequiredArgsConstructor
public class LectureController {

    private final LectureService lectureService;
    private final FileStorageService fileStorageService;

    @PreAuthorize("hasAnyRole('ADMIN','TEACHER')")
    @PostMapping("/add")
    public ResponseEntity<ApiResponse> addLecture(@Valid @RequestBody LectureRequestDTO request) {
        LectureResponseDTO savedLecture = lectureService.addLecture(request);
        return ResponseEntity.ok(new ApiResponse(true, "Lecture created", savedLecture));
    }

    @PostMapping("/upload")
    public ResponseEntity<ApiResponse> uploadFile(@RequestParam("file") MultipartFile file) {
        String fileUrl = fileStorageService.saveFile(file);
        return ResponseEntity.ok(new ApiResponse(true, "File uploaded successfully", fileUrl));
    }

    @GetMapping("/course/{courseId}")
    public ResponseEntity<ApiResponse> getLecturesByCourse(
        @PathVariable Long courseId,
        Authentication authentication
    ) {
        List<LectureResponseDTO> lectures = lectureService.getLecturesByCourse(
            courseId,
            authentication.getName()
        );
        return ResponseEntity.ok(new ApiResponse(true, "Lecture fetched successfully", lectures));
    }
}
