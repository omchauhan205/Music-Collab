package com.musiccollab.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record SettingRequest(
        @NotBlank(message = "Setting value is required")
        @Size(max = 1000, message = "Value must be at most 1000 characters")
        String settingValue
) {
}
