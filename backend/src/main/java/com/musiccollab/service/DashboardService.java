package com.musiccollab.service;

import com.musiccollab.dto.ActivityResponse;
import com.musiccollab.dto.DashboardStatsResponse;
import com.musiccollab.entity.ModerationStatus;
import com.musiccollab.entity.MusicFile;
import com.musiccollab.entity.Role;
import com.musiccollab.entity.User;
import com.musiccollab.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class DashboardService {

    private final UserRepository userRepository;
    private final ProjectRepository projectRepository;
    private final MusicFileRepository musicFileRepository;
    private final CommentRepository commentRepository;
    private final PortfolioItemRepository portfolioItemRepository;
    private final ActivityService activityService;
    private final NotificationService notificationService;
    private final ProjectService projectService;
    private final Mapper mapper;

    public DashboardService(UserRepository userRepository,
                            ProjectRepository projectRepository,
                            MusicFileRepository musicFileRepository,
                            CommentRepository commentRepository,
                            PortfolioItemRepository portfolioItemRepository,
                            ActivityService activityService,
                            NotificationService notificationService,
                            ProjectService projectService,
                            Mapper mapper) {
        this.userRepository = userRepository;
        this.projectRepository = projectRepository;
        this.musicFileRepository = musicFileRepository;
        this.commentRepository = commentRepository;
        this.portfolioItemRepository = portfolioItemRepository;
        this.activityService = activityService;
        this.notificationService = notificationService;
        this.projectService = projectService;
        this.mapper = mapper;
    }

    @Transactional(readOnly = true)
    public DashboardStatsResponse adminStats(User admin) {
        long pendingFiles = musicFileRepository.countByModerationStatus(ModerationStatus.PENDING);
        long pendingComments = commentRepository.countByModerationStatus(ModerationStatus.PENDING);
        Map<String, Long> filesByStatus = new LinkedHashMap<>();
        filesByStatus.put("PENDING", pendingFiles);
        filesByStatus.put("APPROVED", musicFileRepository.countByModerationStatus(ModerationStatus.APPROVED));
        filesByStatus.put("REJECTED", musicFileRepository.countByModerationStatus(ModerationStatus.REJECTED));

        List<ActivityResponse> recent = activityService.recentActivity();
        return new DashboardStatsResponse(
                userRepository.count(),
                userRepository.countByRole(Role.MUSICIAN),
                projectRepository.count(),
                musicFileRepository.count(),
                pendingFiles + pendingComments,
                musicFileRepository.countByModerationStatus(ModerationStatus.APPROVED),
                musicFileRepository.countByModerationStatus(ModerationStatus.REJECTED),
                notificationService.unreadCount(admin.getId()),
                recent,
                filesByStatus);
    }

    @Transactional(readOnly = true)
    public DashboardStatsResponse musicianStats(User musician) {
        List<MusicFile> owned = musicFileRepository.findByOwnerIdOrderByUpdatedAtDesc(musician.getId());
        long pending = owned.stream().filter(f -> f.getModerationStatus() == ModerationStatus.PENDING).count();
        long approved = owned.stream().filter(f -> f.getModerationStatus() == ModerationStatus.APPROVED).count();
        long rejected = owned.stream().filter(f -> f.getModerationStatus() == ModerationStatus.REJECTED).count();

        Map<String, Long> filesByStatus = new LinkedHashMap<>();
        filesByStatus.put("PENDING", pending);
        filesByStatus.put("APPROVED", approved);
        filesByStatus.put("REJECTED", rejected);

        List<ActivityResponse> recent = activityService.recentActivity().stream()
                .filter(a -> a.user() != null && a.user().id().equals(musician.getId()))
                .limit(10)
                .toList();

        return new DashboardStatsResponse(
                0,
                0,
                projectService.listForUser(musician).size(),
                owned.size(),
                pending,
                approved,
                rejected,
                notificationService.unreadCount(musician.getId()),
                recent,
                filesByStatus);
    }
}
