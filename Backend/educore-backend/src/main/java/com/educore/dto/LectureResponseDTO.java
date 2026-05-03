package com.educore.dto;

import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class LectureResponseDTO {

    private Long id;
    private String title;
    private String videoUrl;
    private String pdfUrl;
    private LocalDateTime createdAt;
}
