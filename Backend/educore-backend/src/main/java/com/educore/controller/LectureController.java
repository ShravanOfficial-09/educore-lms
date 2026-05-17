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
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/lectures")
@RequiredArgsConstructor
public class LectureController {

    private final LectureService lectureService;

    private final FileStorageService fileStorageService;

    @PreAuthorize("hasAnyRole('ADMIN','TEACHER')")
    @PostMapping("/create/{courseId}")
    public ResponseEntity<ApiResponse> createLecture(
            @PathVariable Long courseId,
            @Valid @RequestBody LectureRequestDTO request
    ) {

        LectureResponseDTO savedLecture =
                lectureService.createLecture(courseId, request);

        return ResponseEntity.ok(
                new ApiResponse(
                        true,
                        "Lecture created successfully",
                        savedLecture
                )
        );
    }

    @PreAuthorize("hasAnyRole('ADMIN','TEACHER')")
    @PostMapping("/upload")
    public ResponseEntity<ApiResponse> uploadFile(
            @RequestParam("file") MultipartFile file
    ) {

        String fileUrl = fileStorageService.saveFile(file);

        return ResponseEntity.ok(
                new ApiResponse(
                        true,
                        "File uploaded successfully",
                        fileUrl
                )
        );
    }

    @GetMapping("/course/{courseId}")
    public ResponseEntity<ApiResponse> getLecturesByCourse(
            @PathVariable Long courseId
    ) {

        List<LectureResponseDTO> lectures =
                lectureService.getLecturesByCourse(courseId);

        return ResponseEntity.ok(
                new ApiResponse(
                        true,
                        "Lectures fetched successfully",
                        lectures
                )
        );
    }
}