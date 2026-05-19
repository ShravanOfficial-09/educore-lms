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
public class ResourceResponseDTO {

    private Long id;
    private String title;
    private String fileUrl;
    private Long lectureId;
    private LocalDateTime uploadedAt;
}
