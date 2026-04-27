package com.PBL3.Mobile_OnlineShop.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class CartResponse {

    @JsonProperty("cart_id")
    private Long cartId;

    @JsonProperty("user_id")
    private Long userId;

    @JsonProperty("updated_at")
    private LocalDateTime updatedAt;

    private List<CartItemResponse> items;

    private Double total;

    @Data
    @Builder
    public static class CartItemResponse {
        @JsonProperty("cart_detail_id")
        private Long cartDetailId;

        private Integer quantity;

        // Trả về duy nhất 1 Object variant (Quan hệ 1-1 với cart_detail)
        private VariantDto variant;
    }

    @Data
    @Builder
    public static class VariantDto {
        @JsonProperty("product_variant_id")
        private Long productVariantId;

        @JsonProperty("product_name")
        private String productName;

        private String color;

        @JsonProperty("storage_capacity")
        private Long storageCapacity;

        private Double price;

        @JsonProperty("total_available")
        private Long totalAvailable;

        @JsonProperty("variant_image_link")
        private String variantImageLink;
    }
}