package com.musiccollab.dto;

import java.time.Instant;

public record ActivityResponse(
        Long id,
        UserSummary user,
        String action,
        String entityType,
        Long entityId,
        String details,
        Instant createdAt
) {
}
