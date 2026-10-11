package com.musiccollab.repository;

import com.musiccollab.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {

    List<Notification> findByRecipientIdOrderByCreatedAtDesc(Long recipientId);

    long countByRecipientIdAndReadFlagFalse(Long recipientId);

    List<Notification> findByRecipientIdAndReadFlagFalseOrderByCreatedAtDesc(Long recipientId);
}
