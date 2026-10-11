package com.musiccollab.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record MusicFileRequest(
        @NotBlank(message = "File name is required")
        @Size(min = 2, max = 200, message = "Name must be between 2 and 200 characters")
        String name,

        @Size(max = 2000, message = "Description must be at most 2000 characters")
        String description,

        @Size(max = 500, message = "Tags must be at most 500 characters")
        String tags,

        Long projectId
) {
}
