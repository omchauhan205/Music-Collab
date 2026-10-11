package com.musiccollab.service;

import com.musiccollab.dto.UserRequest;
import com.musiccollab.dto.UserResponse;
import com.musiccollab.dto.UserSummary;
import com.musiccollab.entity.Role;
import com.musiccollab.entity.User;
import com.musiccollab.exception.BadRequestException;
import com.musiccollab.exception.NotFoundException;
import com.musiccollab.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.Comparator;
import java.util.List;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final Mapper mapper;
    private final ActivityService activityService;
    private final NotificationService notificationService;

    public UserService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       Mapper mapper,
                       ActivityService activityService,
                       NotificationService notificationService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.mapper = mapper;
        this.activityService = activityService;
        this.notificationService = notificationService;
    }

    @Transactional(readOnly = true)
    public List<UserResponse> listAll() {
        return userRepository.findAll().stream()
                .sorted(Comparator.comparing(User::getId))
                .map(mapper::toUserResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<UserSummary> listMusicians() {
        return userRepository.findByRoleAndEnabledTrue(Role.MUSICIAN).stream()
                .map(mapper::toUserSummary)
                .toList();
    }

    @Transactional(readOnly = true)
    public UserResponse get(Long id) {
        return mapper.toUserResponse(findUser(id));
    }

    @Transactional
    public UserResponse create(UserRequest request, User actor) {
        if (userRepository.existsByEmailIgnoreCase(request.email())) {
            throw new BadRequestException("An account with this email already exists");
        }
        if (!StringUtils.hasText(request.password())) {
            throw new BadRequestException("Password is required when creating a user");
        }
        User user = User.builder()
                .name(request.name().trim())
                .email(request.email().trim().toLowerCase())
                .password(passwordEncoder.encode(request.password()))
                .role(request.role())
                .enabled(request.enabled() == null || request.enabled())
                .bio(request.bio())
                .build();
        user = userRepository.save(user);
        notificationService.notify(user, "Account created",
                "An administrator created your MusicCollab account.", "ACCOUNT", null);
        activityService.log(actor, "CREATE_USER", "User", user.getId(), user.getEmail());
        return mapper.toUserResponse(user);
    }

    @Transactional
    public UserResponse update(Long id, UserRequest request, User actor) {
        User user = findUser(id);
        if (!user.getEmail().equalsIgnoreCase(request.email())
                && userRepository.existsByEmailIgnoreCase(request.email())) {
            throw new BadRequestException("An account with this email already exists");
        }
        user.setName(request.name().trim());
        user.setEmail(request.email().trim().toLowerCase());
        user.setRole(request.role());
        if (request.enabled() != null) {
            if (user.getId().equals(actor.getId()) && !request.enabled()) {
                throw new BadRequestException("You cannot disable your own account");
            }
            user.setEnabled(request.enabled());
        }
        user.setBio(request.bio());
        if (StringUtils.hasText(request.password())) {
            user.setPassword(passwordEncoder.encode(request.password()));
        }
        user = userRepository.save(user);
        activityService.log(actor, "UPDATE_USER", "User", user.getId(), user.getEmail());
        return mapper.toUserResponse(user);
    }

    @Transactional
    public void delete(Long id, User actor) {
        User user = findUser(id);
        if (user.getId().equals(actor.getId())) {
            throw new BadRequestException("You cannot delete your own account");
        }
        userRepository.delete(user);
        activityService.log(actor, "DELETE_USER", "User", id, user.getEmail());
    }

    public User findUser(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("User not found: " + id));
    }
}
