package com.PBL3.Mobile_OnlineShop.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TopProductResponse {
    private Integer rank;
    private Long productId;
    private String productName;
    private String brand;
    private Long productVariantId;
    private String color;
    private Long storageCapacity;
    private Long unitsSold;
    private Double revenue;
    private Double percentage;

    // Constructor dùng cho JPQL (Không truyền rank và percentage vì sẽ tính bằng
    // Java sau)
    public TopProductResponse(Long productId, String productName, String brand,
            Long productVariantId, String color, Long storageCapacity,
            Long unitsSold, Double revenue) {
        this.productId = productId;
        this.productName = productName;
        this.brand = brand;
        this.productVariantId = productVariantId;
        this.color = color;
        this.storageCapacity = storageCapacity;
        this.unitsSold = unitsSold;
        this.revenue = revenue;
    }
}