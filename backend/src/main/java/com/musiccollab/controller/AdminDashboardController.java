package com.musiccollab.controller;

import com.musiccollab.dto.ActivityResponse;
import com.musiccollab.dto.DashboardStatsResponse;
import com.musiccollab.dto.PortfolioItemResponse;
import com.musiccollab.dto.ProjectResponse;
import com.musiccollab.service.ActivityService;
import com.musiccollab.service.CurrentUserService;
import com.musiccollab.service.DashboardService;
import com.musiccollab.service.PortfolioService;
import com.musiccollab.service.ProjectService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@Tag(name = "Admin - Dashboard", description = "Admin dashboard, activity monitoring and oversight")
public class AdminDashboardController {

    private final DashboardService dashboardService;
    private final ActivityService activityService;
    private final ProjectService projectService;
    private final PortfolioService portfolioService;
    private final CurrentUserService currentUserService;

    public AdminDashboardController(DashboardService dashboardService,
                                    ActivityService activityService,
                                    ProjectService projectService,
                                    PortfolioService portfolioService,
                                    CurrentUserService currentUserService) {
        this.dashboardService = dashboardService;
        this.activityService = activityService;
        this.projectService = projectService;
        this.portfolioService = portfolioService;
        this.currentUserService = currentUserService;
    }

    @GetMapping("/dashboard")
    @Operation(summary = "Get admin dashboard statistics")
    public ResponseEntity<DashboardStatsResponse> dashboard() {
        return ResponseEntity.ok(dashboardService.adminStats(currentUserService.requireCurrentUser()));
    }

    @GetMapping("/activity")
    @Operation(summary = "Recent user activity and system events")
    public ResponseEntity<List<ActivityResponse>> activity() {
        return ResponseEntity.ok(activityService.recentActivity());
    }

    @GetMapping("/projects")
    @Operation(summary = "List all projects")
    public ResponseEntity<List<ProjectResponse>> projects() {
        return ResponseEntity.ok(projectService.listAll());
    }

    @GetMapping("/portfolio")
    @Operation(summary = "List all portfolio items")
    public ResponseEntity<List<PortfolioItemResponse>> portfolio() {
        return ResponseEntity.ok(portfolioService.listAll());
    }
}
