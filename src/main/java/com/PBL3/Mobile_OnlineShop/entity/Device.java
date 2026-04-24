package com.PBL3.Mobile_OnlineShop.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.*;
import jakarta.validation.constraints.Pattern;

@Entity
@Table(name = "device")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Device {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long deviceId;

    @NotBlank(message = "IMEI không được để trống")
    @Pattern(regexp = "^[0-9]{15}$", message = "IMEI phải bao gồm đúng 15 chữ số")
    @Column(length = 50, nullable = false, unique = true)
    private String imei;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_variant_id")
    private ProductVariant productVariant;

    @Column(length = 20, name = "status")
    private String status;
}