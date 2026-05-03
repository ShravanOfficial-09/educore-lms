package com.educore.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
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

    private String videoUrl;

    private String pdfUrl;

    @NotNull(message = "CourseId is required")
    private Long courseId;
}
