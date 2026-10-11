package com.musiccollab.dto;

import com.musiccollab.entity.ModerationStatus;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record ModerationDecisionRequest(
        @NotNull(message = "Decision is required (APPROVED or REJECTED)")
        ModerationStatus status,

        @Size(max = 500, message = "Note must be at most 500 characters")
        String note
) {
}
