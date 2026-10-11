package com.musiccollab.service;

import com.musiccollab.dto.PortfolioItemRequest;
import com.musiccollab.dto.PortfolioItemResponse;
import com.musiccollab.entity.MusicFile;
import com.musiccollab.entity.PortfolioItem;
import com.musiccollab.entity.Role;
import com.musiccollab.entity.User;
import com.musiccollab.exception.BadRequestException;
import com.musiccollab.exception.NotFoundException;
import com.musiccollab.repository.MusicFileRepository;
import com.musiccollab.repository.PortfolioItemRepository;
import com.musiccollab.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class PortfolioService {

    private final PortfolioItemRepository portfolioItemRepository;
    private final MusicFileRepository musicFileRepository;
    private final UserRepository userRepository;
    private final Mapper mapper;
    private final ActivityService activityService;

    public PortfolioService(PortfolioItemRepository portfolioItemRepository,
                            MusicFileRepository musicFileRepository,
                            UserRepository userRepository,
                            Mapper mapper,
                            ActivityService activityService) {
        this.portfolioItemRepository = portfolioItemRepository;
        this.musicFileRepository = musicFileRepository;
        this.userRepository = userRepository;
        this.mapper = mapper;
        this.activityService = activityService;
    }

    @Transactional(readOnly = true)
    public List<PortfolioItemResponse> listForUser(Long userId) {
        return portfolioItemRepository.findByOwnerIdOrderByCreatedAtDesc(userId).stream()
                .map(mapper::toPortfolioItemResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<PortfolioItemResponse> listPublicForUser(Long userId) {
        userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("Musician not found: " + userId));
        return listForUser(userId);
    }

    @Transactional(readOnly = true)
    public List<PortfolioItemResponse> listAll() {
        return portfolioItemRepository.findAll().stream()
                .map(mapper::toPortfolioItemResponse)
                .toList();
    }

    @Transactional
    public PortfolioItemResponse create(PortfolioItemRequest request, User owner) {
        PortfolioItem item = PortfolioItem.builder()
                .owner(owner)
                .title(request.title().trim())
                .type(request.type())
                .description(request.description())
                .releaseDate(request.releaseDate())
                .coverImageUrl(request.coverImageUrl())
                .musicFile(resolveMusicFile(request.musicFileId(), owner))
                .build();
        item = portfolioItemRepository.save(item);
        activityService.log(owner, "CREATE_PORTFOLIO", "PortfolioItem", item.getId(), item.getTitle());
        return mapper.toPortfolioItemResponse(item);
    }

    @Transactional
    public PortfolioItemResponse update(Long id, PortfolioItemRequest request, User actor) {
        PortfolioItem item = findItem(id);
        assertOwnerOrAdmin(item, actor);
        item.setTitle(request.title().trim());
        item.setType(request.type());
        item.setDescription(request.description());
        item.setReleaseDate(request.releaseDate());
        item.setCoverImageUrl(request.coverImageUrl());
        item.setMusicFile(resolveMusicFile(request.musicFileId(), item.getOwner()));
        item = portfolioItemRepository.save(item);
        activityService.log(actor, "UPDATE_PORTFOLIO", "PortfolioItem", item.getId(), item.getTitle());
        return mapper.toPortfolioItemResponse(item);
    }

    @Transactional
    public void delete(Long id, User actor) {
        PortfolioItem item = findItem(id);
        assertOwnerOrAdmin(item, actor);
        portfolioItemRepository.delete(item);
        activityService.log(actor, "DELETE_PORTFOLIO", "PortfolioItem", id, item.getTitle());
    }

    private MusicFile resolveMusicFile(Long musicFileId, User owner) {
        if (musicFileId == null) {
            return null;
        }
        MusicFile file = musicFileRepository.findById(musicFileId)
                .orElseThrow(() -> new NotFoundException("Music file not found: " + musicFileId));
        if (owner.getRole() != Role.ADMIN && !file.getOwner().getId().equals(owner.getId())) {
            throw new BadRequestException("You can only link your own music files to the portfolio");
        }
        return file;
    }

    private PortfolioItem findItem(Long id) {
        return portfolioItemRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Portfolio item not found: " + id));
    }

    private void assertOwnerOrAdmin(PortfolioItem item, User user) {
        if (user.getRole() == Role.ADMIN || item.getOwner().getId().equals(user.getId())) {
            return;
        }
        throw new BadRequestException("You can only manage your own portfolio");
    }
}
