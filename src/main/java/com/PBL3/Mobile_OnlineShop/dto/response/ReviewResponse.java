package com.PBL3.Mobile_OnlineShop.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ReviewResponse {
    Long product_review_id;
    Long user_id;
    Long product_id;
    String username;
    Integer rating;
    String comment;
    String review_date;
    Boolean is_purchased;
    variantInfo variant;

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    @FieldDefaults(level = AccessLevel.PRIVATE)
    public static class variantInfo {
        @JsonProperty("product_variant_id")
        Long product_variant_id;
        String color;
        Long storage_capacity;
    }
}
