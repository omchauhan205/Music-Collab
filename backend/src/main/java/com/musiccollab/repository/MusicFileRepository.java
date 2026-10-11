package com.musiccollab.repository;

import com.musiccollab.entity.ModerationStatus;
import com.musiccollab.entity.MusicFile;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Collection;
import java.util.List;

public interface MusicFileRepository extends JpaRepository<MusicFile, Long> {

    List<MusicFile> findByOwnerIdOrderByUpdatedAtDesc(Long ownerId);

    List<MusicFile> findByProjectIdOrderByUpdatedAtDesc(Long projectId);

    List<MusicFile> findByProjectIdInOrderByUpdatedAtDesc(Collection<Long> projectIds);

    List<MusicFile> findByModerationStatusOrderByCreatedAtAsc(ModerationStatus status);

    long countByModerationStatus(ModerationStatus status);

    long countByProjectId(Long projectId);

    long countByOwnerId(Long ownerId);
}
