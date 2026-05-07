package com.PBL3.Mobile_OnlineShop.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "voucher")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Voucher {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long voucherId;

    @NotBlank(message = "Mã voucher không được trống")
    @Column(length = 50, nullable = false, unique = true)
    private String voucherCode;

    @Min(value = 1, message = "Phần trăm giảm tối thiểu là 1%")
    @Max(value = 100, message = "Phần trăm giảm tối đa là 100%")
    @Column(nullable = false)
    private Double discountPercentage;

    private LocalDateTime startDate;

    private LocalDateTime endDate;

    @Min(value = 0, message = "Giới hạn sử dụng không được âm")
    private Long usageLimit;

    @OneToMany(mappedBy = "voucher")
    private List<ApplyCondition> applyConditions;
}