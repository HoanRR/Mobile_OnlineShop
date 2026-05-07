package com.PBL3.Mobile_OnlineShop.dto.response;

import lombok.Data;

@Data
public class ProductVariantResponse {
    private Long productVariantId;
    private String color;
    private Long storageCapacity;
    private Long batteryCapacity;
    private String ram;
    private Double price;
    private String variantImageLink;
    private Long totalAvailable; // Để FE biết còn hàng hay không (Out of stock)
}