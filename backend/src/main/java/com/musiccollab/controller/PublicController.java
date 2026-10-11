package com.musiccollab.controller;

import com.musiccollab.dto.PortfolioItemResponse;
import com.musiccollab.dto.UserSummary;
import com.musiccollab.dto.UserResponse;
import com.musiccollab.repository.UserRepository;
import com.musiccollab.service.Mapper;
import com.musiccollab.service.PortfolioService;
import com.musiccollab.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/public")
@Tag(name = "Public", description = "Publicly accessible endpoints (no authentication)")
public class PublicController {

    private final UserService userService;
    private final PortfolioService portfolioService;
    private final UserRepository userRepository;
    private final Mapper mapper;

    public PublicController(UserService userService,
                            PortfolioService portfolioService,
                            UserRepository userRepository,
                            Mapper mapper) {
        this.userService = userService;
        this.portfolioService = portfolioService;
        this.userRepository = userRepository;
        this.mapper = mapper;
    }

    @GetMapping("/musicians")
    @Operation(summary = "Public directory of active musicians")
    public ResponseEntity<List<UserSummary>> musicians() {
        return ResponseEntity.ok(userService.listMusicians());
    }

    @GetMapping("/musicians/{id}")
    @Operation(summary = "Public musician profile")
    public ResponseEntity<UserResponse> musician(@PathVariable Long id) {
        return ResponseEntity.ok(mapper.toUserResponse(userRepository.findById(id)
                .orElseThrow(() -> new com.musiccollab.exception.NotFoundException("Musician not found: " + id))));
    }

    @GetMapping("/portfolio/{userId}")
    @Operation(summary = "Public portfolio of a musician")
    public ResponseEntity<List<PortfolioItemResponse>> portfolio(@PathVariable Long userId) {
        return ResponseEntity.ok(portfolioService.listPublicForUser(userId));
    }

    @GetMapping("/health")
    @Operation(summary = "Public health check")
    public ResponseEntity<Map<String, String>> health() {
        return ResponseEntity.ok(Map.of("status", "UP", "service", "musiccollab-api"));
    }
}
