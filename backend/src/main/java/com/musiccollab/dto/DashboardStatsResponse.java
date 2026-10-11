package com.musiccollab.dto;

import java.time.Instant;
import java.util.List;
import java.util.Map;

public record DashboardStatsResponse(
        long totalUsers,
        long totalMusicians,
        long totalProjects,
        long totalMusicFiles,
        long pendingModeration,
        long approvedContent,
        long rejectedContent,
        long unreadNotifications,
        List<ActivityResponse> recentActivity,
        Map<String, Long> filesByStatus
) {
}
