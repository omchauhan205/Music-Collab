package com.musiccollab.controller;

import com.musiccollab.dto.CommentResponse;
import com.musiccollab.dto.ModerationDecisionRequest;
import com.musiccollab.dto.MusicFileResponse;
import com.musiccollab.service.CurrentUserService;
import com.musiccollab.service.MusicFileService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/moderation")
@Tag(name = "Admin - Moderation", description = "Content moderation")
public class AdminModerationController {

    private final MusicFileService musicFileService;
    private final CurrentUserService currentUserService;

    public AdminModerationController(MusicFileService musicFileService, CurrentUserService currentUserService) {
        this.musicFileService = musicFileService;
        this.currentUserService = currentUserService;
    }

    @GetMapping("/files")
    @Operation(summary = "List music files pending approval")
    public ResponseEntity<List<MusicFileResponse>> pendingFiles() {
        return ResponseEntity.ok(musicFileService.pendingFiles());
    }

    @GetMapping("/comments")
    @Operation(summary = "List comments pending approval")
    public ResponseEntity<List<CommentResponse>> pendingComments() {
        return ResponseEntity.ok(musicFileService.pendingComments());
    }

    @PatchMapping("/files/{id}")
    @Operation(summary = "Approve or reject a music file")
    public ResponseEntity<MusicFileResponse> moderateFile(@PathVariable Long id,
                                                          @Valid @RequestBody ModerationDecisionRequest request) {
        return ResponseEntity.ok(musicFileService.moderateFile(id, request, currentUserService.requireCurrentUser()));
    }

    @PatchMapping("/comments/{id}")
    @Operation(summary = "Approve or reject a comment")
    public ResponseEntity<CommentResponse> moderateComment(@PathVariable Long id,
                                                           @Valid @RequestBody ModerationDecisionRequest request) {
        return ResponseEntity.ok(
                musicFileService.moderateComment(id, request, currentUserService.requireCurrentUser()));
    }
}
