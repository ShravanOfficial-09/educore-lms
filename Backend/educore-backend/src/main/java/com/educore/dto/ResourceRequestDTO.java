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
public class ResourceRequestDTO {

    @NotBlank(message = "Resource title is required")
    private String title;

    @NotBlank(message = "File URL is required")
    private String fileUrl;
}
