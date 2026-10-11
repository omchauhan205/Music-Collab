package com.musiccollab.dto;

import com.musiccollab.entity.ProjectStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

public record ProjectRequest(
        @NotBlank(message = "Title is required")
        @Size(min = 2, max = 200, message = "Title must be between 2 and 200 characters")
        String title,

        @Size(max = 2000, message = "Description must be at most 2000 characters")
        String description,

        @Size(max = 500, message = "Genre must be at most 500 characters")
        String genre,

        LocalDate deadline,

        ProjectStatus status
) {
}
