package com.musiccollab.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record AddMemberRequest(
        @NotBlank(message = "Musician email is required")
        @Email(message = "Email must be valid")
        String email
) {
}
