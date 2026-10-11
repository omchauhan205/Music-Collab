package com.musiccollab.repository;

import com.musiccollab.entity.Project;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ProjectRepository extends JpaRepository<Project, Long> {

    List<Project> findByOwnerIdOrderByUpdatedAtDesc(Long ownerId);

    @Query("select distinct p from Project p left join p.members m " +
            "where p.owner.id = :userId or m.user.id = :userId order by p.updatedAt desc")
    List<Project> findAllForUser(@Param("userId") Long userId);
}
