package com.musiccollab.dto;

import java.time.Instant;

public record NotificationResponse(
        Long id,
        String title,
        String message,
        String type,
        String link,
        boolean read,
        Instant createdAt
) {
}
