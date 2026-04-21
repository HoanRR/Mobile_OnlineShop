package com.PBL3.Mobile_OnlineShop.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CartItemRequest {
    @NotNull(message = "ID biến thể sản phẩm không được trống")
    private Long productVariantId;

    @Min(value = 1, message = "Số lượng ít nhất là 1")
    private Integer quantity;
}