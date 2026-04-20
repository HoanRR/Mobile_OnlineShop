package com.PBL3.Mobile_OnlineShop.dto.reponse;

import lombok.Data;

@Data
public class CartDetailResponse {
    private Long cartDetailId;
    private Long productVariantId;
    private String productName;
    private String color;
    private Long storageCapacity;
    private Double price;
    private Integer quantity;
    private Double itemTotal;
    private String imageLink;
}