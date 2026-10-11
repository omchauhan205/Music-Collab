package com.musiccollab.dto;

import com.musiccollab.entity.ProjectRole;

import java.time.Instant;

public record ProjectMemberResponse(
        Long id,
        UserSummary user,
        ProjectRole role,
        Instant joinedAt
) {
}
