package com.PBL3.Mobile_OnlineShop.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;
import lombok.experimental.FieldDefaults;
import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@JsonInclude(JsonInclude.Include.NON_NULL)
public class VoucherResponse {

    @JsonProperty("voucher_id")
    Long voucher_id;

    @JsonProperty("voucher_code")
    String voucher_code;

    @JsonProperty("discount_percentage")
    Double discount_percentage;

    @JsonProperty("start_date")
    String start_date;

    @JsonProperty("end_date")
    String end_date;

    @JsonProperty("usage_limit")
    Long usage_limit;

    @JsonProperty("apply_condition")
    ApplyConditionResponse apply_condition;

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    @FieldDefaults(level = AccessLevel.PRIVATE)
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class ApplyConditionResponse {
        /** Giá trị đơn hàng tối thiểu để áp dụng voucher */
        @JsonProperty("min_value")
        Double min_value;

        @JsonProperty("product_variant_ids")
        List<Long> product_variant_ids;

        @JsonProperty("product_variants")
        List<ProductVariantBriefResponse> product_variants;
    }

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    @FieldDefaults(level = AccessLevel.PRIVATE)
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class ProductVariantBriefResponse {
        @JsonProperty("variant_id")
        Long variant_id;

        @JsonProperty("product_name")
        String product_name;

        @JsonProperty("color")
        String color;

        @JsonProperty("storage_capacity")
        Long storage_capacity;

        @JsonProperty("price")
        Double price;
    }
}
