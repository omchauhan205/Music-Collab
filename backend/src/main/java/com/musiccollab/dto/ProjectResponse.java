package com.musiccollab.dto;

import com.musiccollab.entity.ProjectStatus;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;

public record ProjectResponse(
        Long id,
        String title,
        String description,
        String genre,
        LocalDate deadline,
        ProjectStatus status,
        UserSummary owner,
        List<ProjectMemberResponse> members,
        int fileCount,
        Instant createdAt,
        Instant updatedAt
) {
}
