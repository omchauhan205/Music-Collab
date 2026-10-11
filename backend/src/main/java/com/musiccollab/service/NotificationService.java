package com.musiccollab.service;

import com.musiccollab.dto.NotificationResponse;
import com.musiccollab.entity.Notification;
import com.musiccollab.entity.User;
import com.musiccollab.exception.NotFoundException;
import com.musiccollab.repository.NotificationRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final Mapper mapper;

    public NotificationService(NotificationRepository notificationRepository, Mapper mapper) {
        this.notificationRepository = notificationRepository;
        this.mapper = mapper;
    }

    @Transactional
    public void notify(User recipient, String title, String message, String type, String link) {
        if (recipient == null) {
            return;
        }
        notificationRepository.save(Notification.builder()
                .recipient(recipient)
                .title(title)
                .message(message)
                .type(type)
                .link(link)
                .build());
    }

    @Transactional(readOnly = true)
    public List<NotificationResponse> listForUser(Long userId) {
        return notificationRepository.findByRecipientIdOrderByCreatedAtDesc(userId).stream()
                .map(mapper::toNotificationResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public long unreadCount(Long userId) {
        return notificationRepository.countByRecipientIdAndReadFlagFalse(userId);
    }

    @Transactional
    public NotificationResponse markRead(Long id, Long userId) {
        Notification n = notificationRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Notification not found: " + id));
        if (!n.getRecipient().getId().equals(userId)) {
            throw new NotFoundException("Notification not found: " + id);
        }
        n.setReadFlag(true);
        return mapper.toNotificationResponse(notificationRepository.save(n));
    }

    @Transactional
    public int markAllRead(Long userId) {
        List<Notification> unread = notificationRepository
                .findByRecipientIdAndReadFlagFalseOrderByCreatedAtDesc(userId);
        unread.forEach(n -> n.setReadFlag(true));
        notificationRepository.saveAll(unread);
        return unread.size();
    }
}
