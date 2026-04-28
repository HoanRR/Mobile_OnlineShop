package com.PBL3.Mobile_OnlineShop.dto.request;


import com.fasterxml.jackson.annotation.JsonProperty;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AccessLevel;
import lombok.Data;
import lombok.experimental.FieldDefaults;

@Data
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ProductReviewRequest {

    @Min(value = 1, message = "Đánh giá tối thiểu là 1 sao")
    @Max(value = 5, message = "Đánh giá tối đa là 5 sao")
    private Integer rating;

    @NotBlank(message = "Nội dung đánh giá không được để trống")
    private String comment;
    
    @NotNull(message = "Thiếu mã đơn hàng")
    @JsonProperty("order_id")
    Long orderId;

    @JsonProperty("product_variant_id")
    Long productVariantId;

}
