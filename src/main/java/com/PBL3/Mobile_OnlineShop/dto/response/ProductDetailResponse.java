package com.PBL3.Mobile_OnlineShop.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ProductDetailResponse {
    Long product_id;
    String product_name;
    String brand;
    String product_image_link;
    List<ProductVariantResponse> variant;
    List<ReviewResponse> review;
}
