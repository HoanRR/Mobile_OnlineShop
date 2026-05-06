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
    String ram;
    Double price;
    String variantImageLink;
    Long totalAvailable; // Để FE biết còn hàng hay không (Out of stock)
}