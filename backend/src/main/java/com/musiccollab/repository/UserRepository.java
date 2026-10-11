package com.musiccollab.repository;

import com.musiccollab.entity.Role;
import com.musiccollab.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmailIgnoreCase(String email);

    boolean existsByEmailIgnoreCase(String email);

    List<User> findByRole(Role role);

    List<User> findByRoleAndEnabledTrue(Role role);

    long countByRole(Role role);

    long countByEnabledTrue();
}
