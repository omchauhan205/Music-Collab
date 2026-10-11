package com.musiccollab.dto;

import com.musiccollab.entity.ModerationStatus;

import java.time.Instant;

public record CommentResponse(
        Long id,
        String text,
        UserSummary author,
        ModerationStatus moderationStatus,
        Instant createdAt
) {
}
