package com.musiccollab.controller;

import com.musiccollab.dto.UserSummary;
import com.musiccollab.service.CurrentUserService;
import com.musiccollab.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@Tag(name = "Users", description = "Musician directory")
public class UserController {

    private final UserService userService;
    private final CurrentUserService currentUserService;

    public UserController(UserService userService, CurrentUserService currentUserService) {
        this.userService = userService;
        this.currentUserService = currentUserService;
    }

    @GetMapping("/musicians")
    @Operation(summary = "List active musicians available for collaboration")
    public ResponseEntity<List<UserSummary>> musicians() {
        currentUserService.requireCurrentUser();
        return ResponseEntity.ok(userService.listMusicians());
    }
}
