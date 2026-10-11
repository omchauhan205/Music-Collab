package com.musiccollab.repository;

import com.musiccollab.entity.FileVersion;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface FileVersionRepository extends JpaRepository<FileVersion, Long> {

    List<FileVersion> findByMusicFileIdOrderByVersionNumberDesc(Long musicFileId);

    Optional<FileVersion> findFirstByMusicFileIdOrderByVersionNumberDesc(Long musicFileId);
}
