package com.educore.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class LectureRequestDTO {

    @NotBlank(message = "Title is required")
    private String title;

    @NotBlank(message = "Video URL is required")
    private String videoUrl;

    private String pdfUrl;
}
