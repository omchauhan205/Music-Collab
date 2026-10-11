package com.musiccollab.service;

import com.musiccollab.dto.*;
import com.musiccollab.entity.*;
import com.musiccollab.exception.BadRequestException;
import com.musiccollab.exception.NotFoundException;
import com.musiccollab.repository.*;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

@Service
public class MusicFileService {

    private final MusicFileRepository musicFileRepository;
    private final FileVersionRepository fileVersionRepository;
    private final CommentRepository commentRepository;
    private final ProjectRepository projectRepository;
    private final ProjectMemberRepository projectMemberRepository;
    private final FileStorageService fileStorageService;
    private final Mapper mapper;
    private final ActivityService activityService;
    private final NotificationService notificationService;

    public MusicFileService(MusicFileRepository musicFileRepository,
                            FileVersionRepository fileVersionRepository,
                            CommentRepository commentRepository,
                            ProjectRepository projectRepository,
                            ProjectMemberRepository projectMemberRepository,
                            FileStorageService fileStorageService,
                            Mapper mapper,
                            ActivityService activityService,
                            NotificationService notificationService) {
        this.musicFileRepository = musicFileRepository;
        this.fileVersionRepository = fileVersionRepository;
        this.commentRepository = commentRepository;
        this.projectRepository = projectRepository;
        this.projectMemberRepository = projectMemberRepository;
        this.fileStorageService = fileStorageService;
        this.mapper = mapper;
        this.activityService = activityService;
        this.notificationService = notificationService;
    }

    @Transactional(readOnly = true)
    public List<MusicFileResponse> listForUser(User user) {
        if (user.getRole() == Role.ADMIN) {
            return musicFileRepository.findAll().stream().map(mapper::toMusicFileResponse).toList();
        }
        Set<MusicFile> files = new LinkedHashSet<>(musicFileRepository.findByOwnerIdOrderByUpdatedAtDesc(user.getId()));
        List<Long> projectIds = projectRepository.findAllForUser(user.getId()).stream()
                .map(Project::getId).toList();
        if (!projectIds.isEmpty()) {
            files.addAll(musicFileRepository.findByProjectIdInOrderByUpdatedAtDesc(projectIds));
        }
        return files.stream().map(mapper::toMusicFileResponse).toList();
    }

    @Transactional(readOnly = true)
    public MusicFileResponse get(Long id, User user) {
        MusicFile file = findFile(id);
        assertCanAccess(file, user);
        return mapper.toMusicFileResponse(file);
    }

    @Transactional
    public MusicFileResponse upload(MusicFileRequest request, MultipartFile upload, User owner) {
        Project project = null;
        if (request.projectId() != null) {
            project = projectRepository.findById(request.projectId())
                    .orElseThrow(() -> new NotFoundException("Project not found: " + request.projectId()));
            if (!project.getOwner().getId().equals(owner.getId())
                    && !projectMemberRepository.existsByProjectIdAndUserId(project.getId(), owner.getId())
                    && owner.getRole() != Role.ADMIN) {
                throw new BadRequestException("You are not a collaborator on this project");
            }
        }
        MusicFile file = MusicFile.builder()
                .name(request.name().trim())
                .description(request.description())
                .tags(request.tags())
                .owner(owner)
                .project(project)
                .moderationStatus(ModerationStatus.PENDING)
                .currentVersion(0)
                .build();
        file = musicFileRepository.save(file);
        FileVersion version = storeVersion(file, upload, null, owner);
        file.setCurrentVersion(version.getVersionNumber());
        file = musicFileRepository.save(file);
        activityService.log(owner, "UPLOAD_FILE", "MusicFile", file.getId(), file.getName());
        return mapper.toMusicFileResponse(file);
    }

    @Transactional
    public MusicFileResponse updateMetadata(Long id, MusicFileRequest request, User actor) {
        MusicFile file = findFile(id);
        assertIsOwnerOrAdmin(file, actor);
        file.setName(request.name().trim());
        file.setDescription(request.description());
        file.setTags(request.tags());
        if (request.projectId() != null && (file.getProject() == null
                || !request.projectId().equals(file.getProject().getId()))) {
            Project project = projectRepository.findById(request.projectId())
                    .orElseThrow(() -> new NotFoundException("Project not found: " + request.projectId()));
            file.setProject(project);
        } else if (request.projectId() == null) {
            file.setProject(null);
        }
        file = musicFileRepository.save(file);
        activityService.log(actor, "EDIT_FILE", "MusicFile", file.getId(), file.getName());
        return mapper.toMusicFileResponse(file);
    }

    @Transactional
    public MusicFileResponse uploadNewVersion(Long id, MultipartFile upload, String notes, User actor) {
        MusicFile file = findFile(id);
        assertCanAccess(file, actor);
        FileVersion version = storeVersion(file, upload, notes, actor);
        file.setCurrentVersion(version.getVersionNumber());
        file.setModerationStatus(ModerationStatus.PENDING);
        file.setModerationNote(null);
        file = musicFileRepository.save(file);
        activityService.log(actor, "NEW_VERSION", "MusicFile", file.getId(),
                "v" + version.getVersionNumber() + " - " + file.getName());
        notifyCollaborators(file, actor, "New version uploaded",
                "A new version (v" + version.getVersionNumber() + ") of \"" + file.getName() + "\" is available.");
        return mapper.toMusicFileResponse(file);
    }

    @Transactional
    public void delete(Long id, User actor) {
        MusicFile file = findFile(id);
        assertIsOwnerOrAdmin(file, actor);
        for (FileVersion v : file.getVersions()) {
            try {
                fileStorageService.delete(v.getStoredFilename());
            } catch (Exception ignored) {
                // best effort cleanup
            }
        }
        musicFileRepository.delete(file);
        activityService.log(actor, "DELETE_FILE", "MusicFile", id, file.getName());
    }

    @Transactional(readOnly = true)
    public List<FileVersionResponse> listVersions(Long id, User user) {
        MusicFile file = findFile(id);
        assertCanAccess(file, user);
        return fileVersionRepository.findByMusicFileIdOrderByVersionNumberDesc(id).stream()
                .map(mapper::toFileVersionResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public DownloadPayload download(Long id, Long versionId, User user) {
        MusicFile file = findFile(id);
        assertCanAccess(file, user);
        FileVersion version;
        if (versionId != null) {
            version = fileVersionRepository.findById(versionId)
                    .filter(v -> v.getMusicFile().getId().equals(id))
                    .orElseThrow(() -> new NotFoundException("Version not found: " + versionId));
        } else {
            version = fileVersionRepository.findFirstByMusicFileIdOrderByVersionNumberDesc(id)
                    .orElseThrow(() -> new NotFoundException("No version found for file: " + id));
        }
        Resource resource = fileStorageService.loadAsResource(version.getStoredFilename());
        return new DownloadPayload(resource, version.getOriginalFilename(), version.getContentType());
    }

    @Transactional
    public CommentResponse addComment(Long fileId, CommentRequest request, User actor) {
        MusicFile file = findFile(fileId);
        assertCanAccess(file, actor);
        Comment comment = Comment.builder()
                .musicFile(file)
                .author(actor)
                .text(request.text().trim())
                .moderationStatus(ModerationStatus.PENDING)
                .build();
        comment = commentRepository.save(comment);
        activityService.log(actor, "COMMENT", "MusicFile", fileId, file.getName());
        if (!file.getOwner().getId().equals(actor.getId())) {
            notificationService.notify(file.getOwner(), "New comment",
                    actor.getName() + " commented on \"" + file.getName() + "\".",
                    "COMMENT", "/musician/files/" + fileId);
        }
        return mapper.toCommentResponse(comment);
    }

    @Transactional(readOnly = true)
    public List<CommentResponse> listComments(Long fileId, User user) {
        MusicFile file = findFile(fileId);
        assertCanAccess(file, user);
        List<Comment> all = commentRepository.findByMusicFileIdOrderByCreatedAtAsc(fileId);
        boolean admin = user.getRole() == Role.ADMIN;
        return all.stream()
                .filter(c -> admin || c.getModerationStatus() != ModerationStatus.REJECTED
                        || c.getAuthor().getId().equals(user.getId()))
                .map(mapper::toCommentResponse)
                .toList();
    }

    @Transactional
    public MusicFileResponse moderateFile(Long id, ModerationDecisionRequest decision, User admin) {
        MusicFile file = findFile(id);
        if (decision.status() == ModerationStatus.PENDING) {
            throw new BadRequestException("Moderation decision must be APPROVED or REJECTED");
        }
        file.setModerationStatus(decision.status());
        file.setModerationNote(decision.note());
        file = musicFileRepository.save(file);
        notificationService.notify(file.getOwner(),
                "Content " + decision.status().name().toLowerCase(),
                "\"" + file.getName() + "\" was " + decision.status().name().toLowerCase() + " by an administrator.",
                "MODERATION", "/musician/files/" + id);
        activityService.log(admin, "MODERATE_FILE", "MusicFile", id, decision.status().name());
        return mapper.toMusicFileResponse(file);
    }

    @Transactional
    public CommentResponse moderateComment(Long id, ModerationDecisionRequest decision, User admin) {
        Comment comment = commentRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Comment not found: " + id));
        if (decision.status() == ModerationStatus.PENDING) {
            throw new BadRequestException("Moderation decision must be APPROVED or REJECTED");
        }
        comment.setModerationStatus(decision.status());
        comment = commentRepository.save(comment);
        activityService.log(admin, "MODERATE_COMMENT", "Comment", id, decision.status().name());
        return mapper.toCommentResponse(comment);
    }

    @Transactional(readOnly = true)
    public List<MusicFileResponse> pendingFiles() {
        return musicFileRepository.findByModerationStatusOrderByCreatedAtAsc(ModerationStatus.PENDING).stream()
                .map(mapper::toMusicFileResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<CommentResponse> pendingComments() {
        return commentRepository.findByModerationStatusOrderByCreatedAtAsc(ModerationStatus.PENDING).stream()
                .map(mapper::toCommentResponse)
                .toList();
    }

    private FileVersion storeVersion(MusicFile file, MultipartFile upload, String notes, User uploader) {
        if (upload == null || upload.isEmpty()) {
            throw new BadRequestException("A music file is required");
        }
        FileStorageService.StoredFile stored = fileStorageService.store(upload);
        int nextVersion = file.getCurrentVersion() + 1;
        return fileVersionRepository.save(FileVersion.builder()
                .musicFile(file)
                .versionNumber(nextVersion)
                .originalFilename(stored.originalFilename())
                .storedFilename(stored.storedFilename())
                .contentType(stored.contentType())
                .sizeBytes(stored.size())
                .notes(notes)
                .uploadedBy(uploader)
                .build());
    }

    public MusicFile findFile(Long id) {
        return musicFileRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Music file not found: " + id));
    }

    private void assertCanAccess(MusicFile file, User user) {
        if (user.getRole() == Role.ADMIN || file.getOwner().getId().equals(user.getId())) {
            return;
        }
        if (file.getProject() != null
                && projectMemberRepository.existsByProjectIdAndUserId(file.getProject().getId(), user.getId())) {
            return;
        }
        throw new NotFoundException("Music file not found: " + file.getId());
    }

    private void assertIsOwnerOrAdmin(MusicFile file, User user) {
        if (user.getRole() == Role.ADMIN || file.getOwner().getId().equals(user.getId())) {
            return;
        }
        throw new BadRequestException("Only the file owner can perform this action");
    }

    private void notifyCollaborators(MusicFile file, User actor, String title, String message) {
        List<User> recipients = new ArrayList<>();
        if (!file.getOwner().getId().equals(actor.getId())) {
            recipients.add(file.getOwner());
        }
        if (file.getProject() != null) {
            for (ProjectMember member : file.getProject().getMembers()) {
                if (!member.getUser().getId().equals(actor.getId())
                        && recipients.stream().noneMatch(r -> r.getId().equals(member.getUser().getId()))) {
                    recipients.add(member.getUser());
                }
            }
        }
        for (User recipient : recipients) {
            notificationService.notify(recipient, title, message, "FILE", "/musician/files/" + file.getId());
        }
    }

    public record DownloadPayload(Resource resource, String filename, String contentType) {
    }
}
