package com.musiccollab.controller;

import com.musiccollab.dto.DashboardStatsResponse;
import com.musiccollab.service.CurrentUserService;
import com.musiccollab.service.DashboardService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
@Tag(name = "Dashboard", description = "Musician dashboard statistics")
public class DashboardController {

    private final DashboardService dashboardService;
    private final CurrentUserService currentUserService;

    public DashboardController(DashboardService dashboardService, CurrentUserService currentUserService) {
        this.dashboardService = dashboardService;
        this.currentUserService = currentUserService;
    }

    @GetMapping
    @Operation(summary = "Get dashboard statistics for the current musician")
    public ResponseEntity<DashboardStatsResponse> musicianDashboard() {
        return ResponseEntity.ok(dashboardService.musicianStats(currentUserService.requireCurrentUser()));
    }
}
