package com.musiccollab.dto;

import java.time.Instant;

public record FileVersionResponse(
        Long id,
        int versionNumber,
        String originalFilename,
        String contentType,
        long sizeBytes,
        String notes,
        UserSummary uploadedBy,
        String downloadUrl,
        Instant createdAt
) {
}
