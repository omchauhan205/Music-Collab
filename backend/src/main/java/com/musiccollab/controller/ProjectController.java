package com.musiccollab.controller;

import com.musiccollab.dto.*;
import com.musiccollab.service.CurrentUserService;
import com.musiccollab.service.ProjectService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/projects")
@Tag(name = "Projects", description = "Collaborative music projects")
public class ProjectController {

    private final ProjectService projectService;
    private final CurrentUserService currentUserService;

    public ProjectController(ProjectService projectService, CurrentUserService currentUserService) {
        this.projectService = projectService;
        this.currentUserService = currentUserService;
    }

    @GetMapping
    @Operation(summary = "List projects for the current user")
    public ResponseEntity<List<ProjectResponse>> list() {
        return ResponseEntity.ok(projectService.listForUser(currentUserService.requireCurrentUser()));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get a project by id")
    public ResponseEntity<ProjectResponse> get(@PathVariable Long id) {
        return ResponseEntity.ok(projectService.get(id, currentUserService.requireCurrentUser()));
    }

    @PostMapping
    @Operation(summary = "Create a new project")
    public ResponseEntity<ProjectResponse> create(@Valid @RequestBody ProjectRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(projectService.create(request, currentUserService.requireCurrentUser()));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update a project (owner or admin)")
    public ResponseEntity<ProjectResponse> update(@PathVariable Long id,
                                                  @Valid @RequestBody ProjectRequest request) {
        return ResponseEntity.ok(projectService.update(id, request, currentUserService.requireCurrentUser()));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a project (owner or admin)")
    public ResponseEntity<ApiMessage> delete(@PathVariable Long id) {
        projectService.delete(id, currentUserService.requireCurrentUser());
        return ResponseEntity.ok(new ApiMessage("Project deleted successfully"));
    }

    @PostMapping("/{id}/members")
    @Operation(summary = "Add a collaborator by email")
    public ResponseEntity<ProjectResponse> addMember(@PathVariable Long id,
                                                     @Valid @RequestBody AddMemberRequest request) {
        return ResponseEntity.ok(projectService.addMember(id, request, currentUserService.requireCurrentUser()));
    }

    @DeleteMapping("/{id}/members/{userId}")
    @Operation(summary = "Remove a collaborator")
    public ResponseEntity<ProjectResponse> removeMember(@PathVariable Long id, @PathVariable Long userId) {
        return ResponseEntity.ok(projectService.removeMember(id, userId, currentUserService.requireCurrentUser()));
    }
}
