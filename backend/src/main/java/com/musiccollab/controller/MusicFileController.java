package com.musiccollab.controller;

import com.musiccollab.dto.*;
import com.musiccollab.service.CurrentUserService;
import com.musiccollab.service.MusicFileService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/files")
@Tag(name = "Music Files", description = "Upload, version, share and comment on music files")
public class MusicFileController {

    private final MusicFileService musicFileService;
    private final CurrentUserService currentUserService;

    public MusicFileController(MusicFileService musicFileService, CurrentUserService currentUserService) {
        this.musicFileService = musicFileService;
        this.currentUserService = currentUserService;
    }

    @GetMapping
    @Operation(summary = "List music files accessible to the current user")
    public ResponseEntity<List<MusicFileResponse>> list() {
        return ResponseEntity.ok(musicFileService.listForUser(currentUserService.requireCurrentUser()));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get a music file with versions and comments")
    public ResponseEntity<MusicFileResponse> get(@PathVariable Long id) {
        return ResponseEntity.ok(musicFileService.get(id, currentUserService.requireCurrentUser()));
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Upload a new music file")
    public ResponseEntity<MusicFileResponse> upload(
            @RequestParam("name") String name,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam(value = "tags", required = false) String tags,
            @RequestParam(value = "projectId", required = false) Long projectId,
            @RequestParam("file") MultipartFile file) {
        MusicFileRequest request = new MusicFileRequest(name, description, tags, projectId);
        validateName(name);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(musicFileService.upload(request, file, currentUserService.requireCurrentUser()));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update music file metadata")
    public ResponseEntity<MusicFileResponse> update(@PathVariable Long id,
                                                    @Valid @RequestBody MusicFileRequest request) {
        return ResponseEntity.ok(musicFileService.updateMetadata(id, request, currentUserService.requireCurrentUser()));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a music file (owner or admin)")
    public ResponseEntity<ApiMessage> delete(@PathVariable Long id) {
        musicFileService.delete(id, currentUserService.requireCurrentUser());
        return ResponseEntity.ok(new ApiMessage("Music file deleted successfully"));
    }

    @GetMapping("/{id}/versions")
    @Operation(summary = "List all versions of a music file")
    public ResponseEntity<List<FileVersionResponse>> versions(@PathVariable Long id) {
        return ResponseEntity.ok(musicFileService.listVersions(id, currentUserService.requireCurrentUser()));
    }

    @PostMapping(value = "/{id}/versions", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Upload a new version of a music file")
    public ResponseEntity<MusicFileResponse> newVersion(@PathVariable Long id,
                                                        @RequestParam(value = "notes", required = false) String notes,
                                                        @RequestParam("file") MultipartFile file) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(musicFileService.uploadNewVersion(id, file, notes, currentUserService.requireCurrentUser()));
    }

    @GetMapping("/{id}/download")
    @Operation(summary = "Download the latest or a specific version of a music file")
    public ResponseEntity<Resource> download(@PathVariable Long id,
                                             @RequestParam(value = "versionId", required = false) Long versionId) {
        MusicFileService.DownloadPayload payload =
                musicFileService.download(id, versionId, currentUserService.requireCurrentUser());
        MediaType mediaType = payload.contentType() == null
                ? MediaType.APPLICATION_OCTET_STREAM
                : MediaType.parseMediaType(payload.contentType());
        return ResponseEntity.ok()
                .contentType(mediaType)
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + payload.filename() + "\"")
                .body(payload.resource());
    }

    @GetMapping("/{id}/comments")
    @Operation(summary = "List comments on a music file")
    public ResponseEntity<List<CommentResponse>> comments(@PathVariable Long id) {
        return ResponseEntity.ok(musicFileService.listComments(id, currentUserService.requireCurrentUser()));
    }

    @PostMapping("/{id}/comments")
    @Operation(summary = "Add a comment to a music file")
    public ResponseEntity<CommentResponse> addComment(@PathVariable Long id,
                                                      @Valid @RequestBody CommentRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(musicFileService.addComment(id, request, currentUserService.requireCurrentUser()));
    }

    private void validateName(String name) {
        if (!StringUtils.hasText(name) || name.trim().length() < 2) {
            throw new com.musiccollab.exception.BadRequestException("File name must be at least 2 characters");
        }
    }
}
