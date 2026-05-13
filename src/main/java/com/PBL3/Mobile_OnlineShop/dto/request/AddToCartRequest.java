package com.PBL3.Mobile_OnlineShop.dto.request;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class AddToCartRequest {

    @NotNull(message = "ID phân loại sản phẩm không được trống")
    @JsonProperty("product_variant_id")
    private Long productVariantId;

    @NotNull(message = "Số lượng không được trống")
    @Min(value = 1, message = "Số lượng thêm vào giỏ tối thiểu phải là 1")
    private Integer quantity;
}