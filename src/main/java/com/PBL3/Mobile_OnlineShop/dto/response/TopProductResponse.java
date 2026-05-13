package com.PBL3.Mobile_OnlineShop.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class TopProductResponse {
    Integer rank;
    Long product_id;
    String product_name;
    String brand;
    Long product_variant_id;
    String color;
    Long storageCapacity;
    Long batteryCapacity;
    Integer units_sold;
    BigDecimal revenue;
    Double percentage;

    // Constructor dùng cho JPQL "SELECT new TopProductResponse(...)"
    // Thứ tự và kiểu phải khớp chính xác với query
    public TopProductResponse(Long productId, String productName, String brand,
                              Long productVariantId, String color, Long storageCapacity,Long batteryCapacity ,
                              Long unitsSold, Double revenue) {
        this.product_id = productId;
        this.product_name = productName;
        this.brand = brand;
        this.product_variant_id = productVariantId;
        this.batteryCapacity = batteryCapacity;
        this.color = color;
        this.storageCapacity = storageCapacity;
        this.units_sold = unitsSold.intValue();
        this.revenue = revenue != null ? BigDecimal.valueOf(revenue) : BigDecimal.ZERO;
    }
}
