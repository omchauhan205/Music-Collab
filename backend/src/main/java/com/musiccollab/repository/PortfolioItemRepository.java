package com.musiccollab.repository;

import com.musiccollab.entity.PortfolioItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PortfolioItemRepository extends JpaRepository<PortfolioItem, Long> {

    List<PortfolioItem> findByOwnerIdOrderByCreatedAtDesc(Long ownerId);

    List<PortfolioItem> findTop10ByOrderByCreatedAtDesc();

    long countByOwnerId(Long ownerId);
}
