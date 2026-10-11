package com.musiccollab.dto;

import com.musiccollab.entity.Role;

import java.time.Instant;

public record UserResponse(
        Long id,
        String name,
        String email,
        Role role,
        boolean enabled,
        String bio,
        Instant createdAt
) {
}
