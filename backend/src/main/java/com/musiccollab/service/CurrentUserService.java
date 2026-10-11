package com.musiccollab.service;

import com.musiccollab.entity.User;
import com.musiccollab.exception.NotFoundException;
import com.musiccollab.repository.UserRepository;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

@Service
public class CurrentUserService {

    private final UserRepository userRepository;

    public CurrentUserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public User requireCurrentUser() {
        var authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof UserDetails principal)) {
            throw new NotFoundException("No authenticated user found");
        }
        return userRepository.findByEmailIgnoreCase(principal.getUsername())
                .orElseThrow(() -> new NotFoundException("Authenticated user no longer exists"));
    }
}
