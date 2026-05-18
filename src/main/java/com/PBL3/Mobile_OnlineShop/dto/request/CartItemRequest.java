package com.PBL3.Mobile_OnlineShop.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CartItemRequest {

    @NotNull(message = "ID phân loại sản phẩm không được trống")
    Long product_variant_id;

    @NotNull(message = "Số lượng không được trống")
    @Min(value = 1, message = "Số lượng tối thiểu phải là 1")
    Integer quantity;
}
