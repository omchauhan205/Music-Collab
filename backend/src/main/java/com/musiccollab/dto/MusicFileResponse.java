package com.musiccollab.dto;

import com.musiccollab.entity.ModerationStatus;

import java.time.Instant;
import java.util.List;

public record MusicFileResponse(
        Long id,
        String name,
        String description,
        String tags,
        UserSummary owner,
        Long projectId,
        String projectTitle,
        ModerationStatus moderationStatus,
        String moderationNote,
        int currentVersion,
        FileVersionResponse latestVersion,
        List<FileVersionResponse> versions,
        List<CommentResponse> comments,
        Instant createdAt,
        Instant updatedAt
) {
}
