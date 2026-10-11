package com.musiccollab.service;

import com.musiccollab.dto.SettingResponse;
import com.musiccollab.entity.SystemSetting;
import com.musiccollab.entity.User;
import com.musiccollab.exception.NotFoundException;
import com.musiccollab.repository.SystemSettingRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class SettingsService {

    private static final Map<String, String> DEFAULT_SETTINGS = new LinkedHashMap<>();

    static {
        DEFAULT_SETTINGS.put("platform.name", "MusicCollab");
        DEFAULT_SETTINGS.put("content.autoApproveUploads", "false");
        DEFAULT_SETTINGS.put("content.requireCommentApproval", "true");
        DEFAULT_SETTINGS.put("registration.enabled", "true");
        DEFAULT_SETTINGS.put("uploads.maxFileSizeMb", "50");
        DEFAULT_SETTINGS.put("access.adminOnlySettings", "true");
    }

    private final SystemSettingRepository systemSettingRepository;
    private final Mapper mapper;
    private final ActivityService activityService;

    public SettingsService(SystemSettingRepository systemSettingRepository,
                           Mapper mapper,
                           ActivityService activityService) {
        this.systemSettingRepository = systemSettingRepository;
        this.mapper = mapper;
        this.activityService = activityService;
    }

    @Transactional
    public void initializeDefaults() {
        DEFAULT_SETTINGS.forEach((key, value) -> {
            if (!systemSettingRepository.existsBySettingKey(key)) {
                systemSettingRepository.save(SystemSetting.builder()
                        .settingKey(key)
                        .settingValue(value)
                        .description(defaultDescription(key))
                        .build());
            }
        });
    }

    @Transactional(readOnly = true)
    public List<SettingResponse> listAll() {
        return systemSettingRepository.findAll().stream()
                .sorted(Comparator.comparing(SystemSetting::getSettingKey))
                .map(mapper::toSettingResponse)
                .toList();
    }

    @Transactional
    public SettingResponse update(String key, String value, User admin) {
        SystemSetting setting = systemSettingRepository.findBySettingKey(key)
                .orElseThrow(() -> new NotFoundException("Setting not found: " + key));
        setting.setSettingValue(value);
        setting = systemSettingRepository.save(setting);
        activityService.log(admin, "UPDATE_SETTING", "SystemSetting", setting.getId(), key + "=" + value);
        return mapper.toSettingResponse(setting);
    }

    @Transactional(readOnly = true)
    public String get(String key, String fallback) {
        return systemSettingRepository.findBySettingKey(key)
                .map(SystemSetting::getSettingValue)
                .orElse(fallback);
    }

    private String defaultDescription(String key) {
        return switch (key) {
            case "platform.name" -> "Display name of the platform";
            case "content.autoApproveUploads" -> "Automatically approve newly uploaded music files";
            case "content.requireCommentApproval" -> "Require administrator approval for comments";
            case "registration.enabled" -> "Allow self-service musician registration";
            case "uploads.maxFileSizeMb" -> "Maximum upload size in megabytes";
            case "access.adminOnlySettings" -> "Restrict system settings to administrators";
            default -> null;
        };
    }
}
