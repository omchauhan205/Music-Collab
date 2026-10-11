package com.musiccollab.service;

import com.musiccollab.dto.AuthResponse;
import com.musiccollab.dto.LoginRequest;
import com.musiccollab.dto.RegisterRequest;
import com.musiccollab.dto.UserResponse;
import com.musiccollab.entity.Role;
import com.musiccollab.entity.User;
import com.musiccollab.exception.BadRequestException;
import com.musiccollab.repository.UserRepository;
import com.musiccollab.security.JwtService;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.Map;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final Mapper mapper;
    private final ActivityService activityService;
    private final NotificationService notificationService;

    public AuthService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       JwtService jwtService,
                       AuthenticationManager authenticationManager,
                       Mapper mapper,
                       ActivityService activityService,
                       NotificationService notificationService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.authenticationManager = authenticationManager;
        this.mapper = mapper;
        this.activityService = activityService;
        this.notificationService = notificationService;
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmailIgnoreCase(request.email())) {
            throw new BadRequestException("An account with this email already exists");
        }
        User user = User.builder()
                .name(request.name().trim())
                .email(request.email().trim().toLowerCase())
                .password(passwordEncoder.encode(request.password()))
                .role(Role.MUSICIAN)
                .enabled(true)
                .build();
        user = userRepository.save(user);

        notificationService.notify(user, "Welcome to MusicCollab",
                "Your musician account is ready. Start by creating a project or uploading a track.",
                "WELCOME", "/musician/projects");
        activityService.log(user, "REGISTER", "User", user.getId(), user.getEmail());

        return buildAuthResponse(user);
    }

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.email().trim().toLowerCase(), request.password()));
        User user = userRepository.findByEmailIgnoreCase(request.email())
                .orElseThrow(() -> new BadRequestException("Invalid email or password"));
        if (!user.isEnabled()) {
            throw new BadRequestException("Your account has been disabled. Please contact an administrator.");
        }
        return buildAuthResponse(user);
    }

    @Transactional(readOnly = true)
    public UserResponse me(User user) {
        return mapper.toUserResponse(user);
    }

    private AuthResponse buildAuthResponse(User user) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("uid", user.getId());
        claims.put("role", user.getRole().name());
        claims.put("name", user.getName());
        String token = jwtService.generateToken(user.getEmail(), claims);
        return new AuthResponse(token, "Bearer", jwtService.expirationMs(), mapper.toUserResponse(user));
    }
}
