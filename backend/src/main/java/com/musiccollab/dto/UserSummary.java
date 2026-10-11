package com.musiccollab.dto;

import com.musiccollab.entity.Role;

public record UserSummary(
        Long id,
        String name,
        String email,
        Role role
) {
}
