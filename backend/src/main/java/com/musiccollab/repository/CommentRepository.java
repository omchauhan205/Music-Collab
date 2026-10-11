package com.musiccollab.repository;

import com.musiccollab.entity.Comment;
import com.musiccollab.entity.ModerationStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CommentRepository extends JpaRepository<Comment, Long> {

    List<Comment> findByMusicFileIdOrderByCreatedAtAsc(Long musicFileId);

    List<Comment> findByModerationStatusOrderByCreatedAtAsc(ModerationStatus status);

    long countByModerationStatus(ModerationStatus status);
}
