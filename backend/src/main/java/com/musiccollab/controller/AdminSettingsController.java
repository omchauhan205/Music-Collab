package com.musiccollab.controller;

import com.musiccollab.dto.SettingRequest;
import com.musiccollab.dto.SettingResponse;
import com.musiccollab.service.CurrentUserService;
import com.musiccollab.service.SettingsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/settings")
@Tag(name = "Admin - Settings", description = "System settings and configuration")
public class AdminSettingsController {

    private final SettingsService settingsService;
    private final CurrentUserService currentUserService;

    public AdminSettingsController(SettingsService settingsService, CurrentUserService currentUserService) {
        this.settingsService = settingsService;
        this.currentUserService = currentUserService;
    }

    @GetMapping
    @Operation(summary = "List all system settings")
    public ResponseEntity<List<SettingResponse>> list() {
        return ResponseEntity.ok(settingsService.listAll());
    }

    @PutMapping("/{key}")
    @Operation(summary = "Update a system setting")
    public ResponseEntity<SettingResponse> update(@PathVariable String key,
                                                  @Valid @RequestBody SettingRequest request) {
        return ResponseEntity.ok(settingsService.update(key, request.settingValue(),
                currentUserService.requireCurrentUser()));
    }
}
