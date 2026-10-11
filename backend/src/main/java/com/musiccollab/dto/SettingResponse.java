package com.musiccollab.dto;

import java.time.Instant;

public record SettingResponse(
        Long id,
        String settingKey,
        String settingValue,
        String description,
        Instant updatedAt
) {
}
