package com.musiccollab.controller;

import com.musiccollab.dto.ApiMessage;
import com.musiccollab.dto.PortfolioItemRequest;
import com.musiccollab.dto.PortfolioItemResponse;
import com.musiccollab.entity.User;
import com.musiccollab.service.CurrentUserService;
import com.musiccollab.service.PortfolioService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/portfolio")
@Tag(name = "Portfolio", description = "Musician music portfolio")
public class PortfolioController {

    private final PortfolioService portfolioService;
    private final CurrentUserService currentUserService;

    public PortfolioController(PortfolioService portfolioService, CurrentUserService currentUserService) {
        this.portfolioService = portfolioService;
        this.currentUserService = currentUserService;
    }

    @GetMapping
    @Operation(summary = "List the current user's portfolio items")
    public ResponseEntity<List<PortfolioItemResponse>> list() {
        User user = currentUserService.requireCurrentUser();
        return ResponseEntity.ok(portfolioService.listForUser(user.getId()));
    }

    @PostMapping
    @Operation(summary = "Add a portfolio item")
    public ResponseEntity<PortfolioItemResponse> create(@Valid @RequestBody PortfolioItemRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(portfolioService.create(request, currentUserService.requireCurrentUser()));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update a portfolio item")
    public ResponseEntity<PortfolioItemResponse> update(@PathVariable Long id,
                                                        @Valid @RequestBody PortfolioItemRequest request) {
        return ResponseEntity.ok(portfolioService.update(id, request, currentUserService.requireCurrentUser()));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a portfolio item")
    public ResponseEntity<ApiMessage> delete(@PathVariable Long id) {
        portfolioService.delete(id, currentUserService.requireCurrentUser());
        return ResponseEntity.ok(new ApiMessage("Portfolio item deleted successfully"));
    }
}
