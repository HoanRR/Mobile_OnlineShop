package com.PBL3.Mobile_OnlineShop.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "warranty")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Warranty {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long warrantyId;

    @ManyToOne
    @JoinColumn(name = "device_id")
    private Device device;

    private LocalDateTime startDate;

    private LocalDateTime endDate;

    private Integer warrantyMonth;
}