package com.PBL3.Mobile_OnlineShop.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "voucher")
@Data
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

    @Column(name = "max_discount_amount", nullable = false)
    private Double maxDiscountAmount;// thêm trường này để khỏi nổ két cửa hàng

    @Min(value = 0, message = "Giới hạn sử dụng không được âm")
    private Long usageLimit;

    @OneToOne(mappedBy = "voucher", cascade = CascadeType.ALL)
    private ApplyCondition applyCondition;

    public boolean isAvailable() { // Hàm hỗ trợ kiểm tra logic
        LocalDateTime now = LocalDateTime.now();
        return (startDate == null || now.isAfter(startDate)) &&
                (endDate == null || now.isBefore(endDate)) &&
                (usageLimit == null || usageLimit > 0);
    }
}