package com.educore.controller;

import com.educore.common.ApiResponse;
import com.educore.service.FileUploadService;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/upload")
@RequiredArgsConstructor
public class UploadController {

    private final FileUploadService fileUploadService;

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/file")
    public ResponseEntity<ApiResponse> uploadFile(@RequestParam("file") MultipartFile file) {
        String fileUrl = fileUploadService.uploadFile(file);

        return ResponseEntity.ok(
                new ApiResponse(
                        true,
                        "File uploaded successfully",
                        Map.of("fileUrl", fileUrl)
                )
        );
    }
}
