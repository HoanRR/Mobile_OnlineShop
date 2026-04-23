package com.PBL3.Mobile_OnlineShop.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.Instant;

@Entity
@Table(name = "invalidated_token", indexes = @Index(name = "idx_invalidated_token_expires_at", columnList = "expiresAt"))
@Data
@NoArgsConstructor
@AllArgsConstructor
public class InvalidatedToken {

    @Id
    private String id;

    @Column(length = 1000, nullable = false)
    private String token;

    @Column(nullable = false)
    private Instant expiresAt;
}