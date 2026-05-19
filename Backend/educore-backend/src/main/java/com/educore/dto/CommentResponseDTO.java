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
public class CommentResponseDTO {

    private Long id;
    private String message;
    private String userEmail;
    private Long lectureId;
    private LocalDateTime createdAt;
}
