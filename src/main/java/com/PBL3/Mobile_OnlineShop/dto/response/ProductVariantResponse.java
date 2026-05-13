package com.PBL3.Mobile_OnlineShop.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ProductVariantResponse {
    Long productVariantId;
    String color;
    String chip;
    Long storageCapacity;
    Long batteryCapacity;
    String resolution;
    String ram;
    String screenSize;
    String frontCamera;
    String rearCamera;
    String simCard;
    Double price;
    String variantImageLink;
    Long totalAvailable; // Để FE biết còn hàng hay không (Out of stock)
}