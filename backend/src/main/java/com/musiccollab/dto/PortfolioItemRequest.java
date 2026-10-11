package com.musiccollab.dto;

import com.musiccollab.entity.PortfolioType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

public record PortfolioItemRequest(
        @NotBlank(message = "Title is required")
        @Size(min = 1, max = 200, message = "Title must be between 1 and 200 characters")
        String title,

        @NotNull(message = "Type is required (SONG or ALBUM)")
        PortfolioType type,

        @Size(max = 2000, message = "Description must be at most 2000 characters")
        String description,

        LocalDate releaseDate,

        @Size(max = 500, message = "Cover image URL must be at most 500 characters")
        String coverImageUrl,

        Long musicFileId
) {
}
