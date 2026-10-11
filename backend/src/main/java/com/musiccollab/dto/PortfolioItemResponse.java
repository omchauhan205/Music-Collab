package com.musiccollab.dto;

import com.musiccollab.entity.PortfolioType;

import java.time.Instant;
import java.time.LocalDate;

public record PortfolioItemResponse(
        Long id,
        String title,
        PortfolioType type,
        String description,
        LocalDate releaseDate,
        String coverImageUrl,
        Long musicFileId,
        String musicFileName,
        UserSummary owner,
        Instant createdAt,
        Instant updatedAt
) {
}
