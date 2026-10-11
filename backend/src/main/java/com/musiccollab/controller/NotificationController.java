package com.musiccollab.controller;

import com.musiccollab.dto.ApiMessage;
import com.musiccollab.dto.NotificationResponse;
import com.musiccollab.entity.User;
import com.musiccollab.service.CurrentUserService;
import com.musiccollab.service.NotificationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@Tag(name = "Notifications", description = "User notification center")
public class NotificationController {

    private final NotificationService notificationService;
    private final CurrentUserService currentUserService;

    public NotificationController(NotificationService notificationService, CurrentUserService currentUserService) {
        this.notificationService = notificationService;
        this.currentUserService = currentUserService;
    }

    @GetMapping
    @Operation(summary = "List notifications for the current user")
    public ResponseEntity<List<NotificationResponse>> list() {
        User user = currentUserService.requireCurrentUser();
        return ResponseEntity.ok(notificationService.listForUser(user.getId()));
    }

    @GetMapping("/unread-count")
    @Operation(summary = "Get the number of unread notifications")
    public ResponseEntity<Map<String, Long>> unreadCount() {
        User user = currentUserService.requireCurrentUser();
        return ResponseEntity.ok(Map.of("count", notificationService.unreadCount(user.getId())));
    }

    @PatchMapping("/{id}/read")
    @Operation(summary = "Mark a notification as read")
    public ResponseEntity<NotificationResponse> markRead(@PathVariable Long id) {
        User user = currentUserService.requireCurrentUser();
        return ResponseEntity.ok(notificationService.markRead(id, user.getId()));
    }

    @PostMapping("/read-all")
    @Operation(summary = "Mark all notifications as read")
    public ResponseEntity<ApiMessage> markAllRead() {
        User user = currentUserService.requireCurrentUser();
        int updated = notificationService.markAllRead(user.getId());
        return ResponseEntity.ok(new ApiMessage(updated + " notifications marked as read"));
    }
}
