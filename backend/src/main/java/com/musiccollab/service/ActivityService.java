package com.musiccollab.service;

import com.musiccollab.dto.ActivityResponse;
import com.musiccollab.entity.ActivityLog;
import com.musiccollab.entity.User;
import com.musiccollab.repository.ActivityLogRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ActivityService {

    private final ActivityLogRepository activityLogRepository;
    private final Mapper mapper;

    public ActivityService(ActivityLogRepository activityLogRepository, Mapper mapper) {
        this.activityLogRepository = activityLogRepository;
        this.mapper = mapper;
    }

    @Transactional
    public void log(User user, String action, String entityType, Long entityId, String details) {
        activityLogRepository.save(ActivityLog.builder()
                .user(user)
                .action(action)
                .entityType(entityType)
                .entityId(entityId)
                .details(details)
                .build());
    }

    @Transactional(readOnly = true)
    public List<ActivityResponse> recentActivity() {
        return activityLogRepository.findTop100ByOrderByCreatedAtDesc().stream()
                .map(mapper::toActivityResponse)
                .toList();
    }
}
