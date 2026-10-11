package com.musiccollab.service;

import com.musiccollab.dto.*;
import com.musiccollab.entity.*;
import com.musiccollab.exception.BadRequestException;
import com.musiccollab.exception.NotFoundException;
import com.musiccollab.repository.MusicFileRepository;
import com.musiccollab.repository.ProjectMemberRepository;
import com.musiccollab.repository.ProjectRepository;
import com.musiccollab.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final ProjectMemberRepository projectMemberRepository;
    private final MusicFileRepository musicFileRepository;
    private final UserRepository userRepository;
    private final Mapper mapper;
    private final ActivityService activityService;
    private final NotificationService notificationService;

    public ProjectService(ProjectRepository projectRepository,
                          ProjectMemberRepository projectMemberRepository,
                          MusicFileRepository musicFileRepository,
                          UserRepository userRepository,
                          Mapper mapper,
                          ActivityService activityService,
                          NotificationService notificationService) {
        this.projectRepository = projectRepository;
        this.projectMemberRepository = projectMemberRepository;
        this.musicFileRepository = musicFileRepository;
        this.userRepository = userRepository;
        this.mapper = mapper;
        this.activityService = activityService;
        this.notificationService = notificationService;
    }

    @Transactional(readOnly = true)
    public List<ProjectResponse> listForUser(User user) {
        return projectRepository.findAllForUser(user.getId()).stream()
                .map(this::mapWithCounts)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<ProjectResponse> listAll() {
        return projectRepository.findAll().stream()
                .map(this::mapWithCounts)
                .toList();
    }

    @Transactional(readOnly = true)
    public ProjectResponse get(Long id, User user) {
        Project project = findProject(id);
        assertCanView(project, user);
        return mapWithCounts(project);
    }

    @Transactional
    public ProjectResponse create(ProjectRequest request, User owner) {
        Project project = Project.builder()
                .title(request.title().trim())
                .description(request.description())
                .genre(request.genre())
                .deadline(request.deadline())
                .status(request.status() == null ? ProjectStatus.OPEN : request.status())
                .owner(owner)
                .build();
        project = projectRepository.save(project);
        ProjectMember member = ProjectMember.builder()
                .project(project)
                .user(owner)
                .role(ProjectRole.OWNER)
                .build();
        projectMemberRepository.save(member);
        activityService.log(owner, "CREATE_PROJECT", "Project", project.getId(), project.getTitle());
        return mapWithCounts(project);
    }

    @Transactional
    public ProjectResponse update(Long id, ProjectRequest request, User actor) {
        Project project = findProject(id);
        assertCanManage(project, actor);
        project.setTitle(request.title().trim());
        project.setDescription(request.description());
        project.setGenre(request.genre());
        project.setDeadline(request.deadline());
        if (request.status() != null) {
            project.setStatus(request.status());
        }
        project = projectRepository.save(project);
        activityService.log(actor, "UPDATE_PROJECT", "Project", project.getId(), project.getTitle());
        notifyMembers(project, actor, "Project updated",
                "Project \"" + project.getTitle() + "\" was updated.");
        return mapWithCounts(project);
    }

    @Transactional
    public void delete(Long id, User actor) {
        Project project = findProject(id);
        assertCanManage(project, actor);
        projectRepository.delete(project);
        activityService.log(actor, "DELETE_PROJECT", "Project", id, project.getTitle());
    }

    @Transactional
    public ProjectResponse addMember(Long projectId, AddMemberRequest request, User actor) {
        Project project = findProject(projectId);
        assertCanManage(project, actor);
        User musician = userRepository.findByEmailIgnoreCase(request.email())
                .orElseThrow(() -> new NotFoundException("No musician found with email: " + request.email()));
        if (musician.getRole() != Role.MUSICIAN) {
            throw new BadRequestException("Only musicians can be added as collaborators");
        }
        if (projectMemberRepository.existsByProjectIdAndUserId(projectId, musician.getId())) {
            throw new BadRequestException("This musician is already a collaborator on the project");
        }
        projectMemberRepository.save(ProjectMember.builder()
                .project(project)
                .user(musician)
                .role(ProjectRole.COLLABORATOR)
                .build());
        notificationService.notify(musician, "Added to project",
                "You were added to the project \"" + project.getTitle() + "\".",
                "PROJECT", "/musician/projects/" + project.getId());
        activityService.log(actor, "ADD_COLLABORATOR", "Project", projectId, musician.getEmail());
        Project refreshed = findProject(projectId);
        return mapWithCounts(refreshed);
    }

    @Transactional
    public ProjectResponse removeMember(Long projectId, Long userId, User actor) {
        Project project = findProject(projectId);
        assertCanManage(project, actor);
        if (project.getOwner().getId().equals(userId)) {
            throw new BadRequestException("The project owner cannot be removed");
        }
        ProjectMember member = projectMemberRepository.findByProjectIdAndUserId(projectId, userId)
                .orElseThrow(() -> new NotFoundException("This user is not a collaborator on the project"));
        projectMemberRepository.delete(member);
        projectMemberRepository.flush();
        activityService.log(actor, "REMOVE_COLLABORATOR", "Project", projectId, "userId=" + userId);
        return mapWithCounts(findProject(projectId));
    }

    public Project findProject(Long id) {
        return projectRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Project not found: " + id));
    }

    public ProjectResponse mapWithCounts(Project project) {
        int fileCount = (int) musicFileRepository.countByProjectId(project.getId());
        return mapper.toProjectResponse(project, fileCount);
    }

    private void assertCanView(Project project, User user) {
        if (user.getRole() == Role.ADMIN) {
            return;
        }
        boolean member = project.getOwner().getId().equals(user.getId())
                || projectMemberRepository.existsByProjectIdAndUserId(project.getId(), user.getId());
        if (!member) {
            throw new NotFoundException("Project not found: " + project.getId());
        }
    }

    private void assertCanManage(Project project, User user) {
        if (user.getRole() == Role.ADMIN) {
            return;
        }
        if (!project.getOwner().getId().equals(user.getId())) {
            throw new BadRequestException("Only the project owner can perform this action");
        }
    }

    private void notifyMembers(Project project, User actor, String title, String message) {
        for (ProjectMember member : project.getMembers()) {
            if (!member.getUser().getId().equals(actor.getId())) {
                notificationService.notify(member.getUser(), title, message, "PROJECT",
                        "/musician/projects/" + project.getId());
            }
        }
    }
}
