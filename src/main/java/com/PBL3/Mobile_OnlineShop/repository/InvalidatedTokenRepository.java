package com.PBL3.Mobile_OnlineShop.repository;

import com.PBL3.Mobile_OnlineShop.entity.InvalidatedToken;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface InvalidatedTokenRepository extends JpaRepository<InvalidatedToken, String> {
    // Spring Data JPA sẽ tự lo hết, không cần viết gì thêm!
    boolean existsByToken(String token);

    @Transactional
    long deleteByExpiresAtBefore(Instant now);
}