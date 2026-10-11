package com.musiccollab.controller;

import com.musiccollab.dto.ApiMessage;
import com.musiccollab.dto.UserRequest;
import com.musiccollab.dto.UserResponse;
import com.musiccollab.service.CurrentUserService;
import com.musiccollab.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/users")
@Tag(name = "Admin - Users", description = "Admin user management")
public class AdminUserController {

    private final UserService userService;
    private final CurrentUserService currentUserService;

    public AdminUserController(UserService userService, CurrentUserService currentUserService) {
        this.userService = userService;
        this.currentUserService = currentUserService;
    }

    @GetMapping
    @Operation(summary = "List all user accounts")
    public ResponseEntity<List<UserResponse>> list() {
        return ResponseEntity.ok(userService.listAll());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get a user account")
    public ResponseEntity<UserResponse> get(@PathVariable Long id) {
        return ResponseEntity.ok(userService.get(id));
    }

    @PostMapping
    @Operation(summary = "Create a user account")
    public ResponseEntity<UserResponse> create(@Valid @RequestBody UserRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(userService.create(request, currentUserService.requireCurrentUser()));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update a user account or role")
    public ResponseEntity<UserResponse> update(@PathVariable Long id, @Valid @RequestBody UserRequest request) {
        return ResponseEntity.ok(userService.update(id, request, currentUserService.requireCurrentUser()));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a user account")
    public ResponseEntity<ApiMessage> delete(@PathVariable Long id) {
        userService.delete(id, currentUserService.requireCurrentUser());
        return ResponseEntity.ok(new ApiMessage("User deleted successfully"));
    }
}
