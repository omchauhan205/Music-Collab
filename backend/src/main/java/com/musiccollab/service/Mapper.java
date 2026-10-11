package com.musiccollab.service;

import com.musiccollab.dto.*;
import com.musiccollab.entity.*;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class Mapper {

    private final FileStorageService fileStorageService;

    public Mapper(FileStorageService fileStorageService) {
        this.fileStorageService = fileStorageService;
    }

    public UserResponse toUserResponse(User u) {
        if (u == null) {
            return null;
        }
        return new UserResponse(u.getId(), u.getName(), u.getEmail(), u.getRole(),
                u.isEnabled(), u.getBio(), u.getCreatedAt());
    }

    public UserSummary toUserSummary(User u) {
        if (u == null) {
            return null;
        }
        return new UserSummary(u.getId(), u.getName(), u.getEmail(), u.getRole());
    }

    public FileVersionResponse toFileVersionResponse(FileVersion v) {
        if (v == null) {
            return null;
        }
        return new FileVersionResponse(
                v.getId(),
                v.getVersionNumber(),
                v.getOriginalFilename(),
                v.getContentType(),
                v.getSizeBytes(),
                v.getNotes(),
                toUserSummary(v.getUploadedBy()),
                fileStorageService.publicUrl(v.getStoredFilename()),
                v.getCreatedAt());
    }

    public CommentResponse toCommentResponse(Comment c) {
        if (c == null) {
            return null;
        }
        return new CommentResponse(c.getId(), c.getText(), toUserSummary(c.getAuthor()),
                c.getModerationStatus(), c.getCreatedAt());
    }

    public MusicFileResponse toMusicFileResponse(MusicFile f) {
        if (f == null) {
            return null;
        }
        List<FileVersionResponse> versions = f.getVersions().stream()
                .sorted((a, b) -> Integer.compare(b.getVersionNumber(), a.getVersionNumber()))
                .map(this::toFileVersionResponse)
                .toList();
        List<CommentResponse> comments = f.getComments().stream()
                .map(this::toCommentResponse)
                .toList();
        FileVersionResponse latest = versions.isEmpty() ? null : versions.get(0);
        return new MusicFileResponse(
                f.getId(),
                f.getName(),
                f.getDescription(),
                f.getTags(),
                toUserSummary(f.getOwner()),
                f.getProject() == null ? null : f.getProject().getId(),
                f.getProject() == null ? null : f.getProject().getTitle(),
                f.getModerationStatus(),
                f.getModerationNote(),
                f.getCurrentVersion(),
                latest,
                versions,
                comments,
                f.getCreatedAt(),
                f.getUpdatedAt());
    }

    public ProjectMemberResponse toProjectMemberResponse(ProjectMember m) {
        return new ProjectMemberResponse(m.getId(), toUserSummary(m.getUser()), m.getRole(), m.getJoinedAt());
    }

    public ProjectResponse toProjectResponse(Project p, int fileCount) {
        List<ProjectMemberResponse> members = p.getMembers().stream()
                .map(this::toProjectMemberResponse)
                .toList();
        return new ProjectResponse(
                p.getId(),
                p.getTitle(),
                p.getDescription(),
                p.getGenre(),
                p.getDeadline(),
                p.getStatus(),
                toUserSummary(p.getOwner()),
                members,
                fileCount,
                p.getCreatedAt(),
                p.getUpdatedAt());
    }

    public PortfolioItemResponse toPortfolioItemResponse(PortfolioItem i) {
        MusicFile mf = i.getMusicFile();
        return new PortfolioItemResponse(
                i.getId(),
                i.getTitle(),
                i.getType(),
                i.getDescription(),
                i.getReleaseDate(),
                i.getCoverImageUrl(),
                mf == null ? null : mf.getId(),
                mf == null ? null : mf.getName(),
                toUserSummary(i.getOwner()),
                i.getCreatedAt(),
                i.getUpdatedAt());
    }

    public NotificationResponse toNotificationResponse(Notification n) {
        return new NotificationResponse(n.getId(), n.getTitle(), n.getMessage(), n.getType(),
                n.getLink(), n.isReadFlag(), n.getCreatedAt());
    }

    public SettingResponse toSettingResponse(SystemSetting s) {
        return new SettingResponse(s.getId(), s.getSettingKey(), s.getSettingValue(),
                s.getDescription(), s.getUpdatedAt());
    }

    public ActivityResponse toActivityResponse(ActivityLog a) {
        return new ActivityResponse(a.getId(), toUserSummary(a.getUser()), a.getAction(),
                a.getEntityType(), a.getEntityId(), a.getDetails(), a.getCreatedAt());
    }
}
