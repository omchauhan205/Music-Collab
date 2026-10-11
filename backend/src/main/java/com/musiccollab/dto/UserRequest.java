package com.musiccollab.dto;

import com.musiccollab.entity.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record UserRequest(
        @NotBlank(message = "Name is required")
        @Size(min = 2, max = 120, message = "Name must be between 2 and 120 characters")
        String name,

        @NotBlank(message = "Email is required")
        @Email(message = "Email must be valid")
        String email,

        @Size(min = 8, max = 100, message = "Password must be at least 8 characters")
        String password,

        @NotNull(message = "Role is required")
        Role role,

        Boolean enabled,

        @Size(max = 500, message = "Bio must be at most 500 characters")
        String bio
) {
}
