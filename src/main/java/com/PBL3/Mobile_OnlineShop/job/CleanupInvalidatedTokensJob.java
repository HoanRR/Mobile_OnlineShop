package com.PBL3.Mobile_OnlineShop.job;

import com.PBL3.Mobile_OnlineShop.repository.InvalidatedTokenRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.Instant;

@Component
@RequiredArgsConstructor
public class CleanupInvalidatedTokensJob {

    private final InvalidatedTokenRepository repo;

    // chạy mỗi ngày 02:00
    @Scheduled(cron = "0 0 2 * * *")
    public void cleanup() {
        repo.deleteByExpiresAtBefore(Instant.now());
    }
}