package com.PBL3.Mobile_OnlineShop.dto.request;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.*;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class VoucherCreateRequest {

    @NotBlank(message = "Mã voucher không được để trống")
    @JsonProperty("voucher_code")
    private String voucherCode;

    @Min(1)
    @Max(100)
    @NotNull(message = "Phần trăm giảm giá không được để trống")
    @JsonProperty("discount_percentage")
    private Double discountPercentage;

    @NotNull(message = "Số tiền giảm tối đa không được để trống")
    @JsonProperty("max_discount_amount")
    private Double maxDiscountAmount;

    @JsonProperty("start_date")
    private LocalDateTime startDate;

    @JsonProperty("end_date")
    private LocalDateTime endDate;

    @Min(0)
    @JsonProperty("usage_limit")
    private Long usageLimit;

    // Object lồng nhau chứa điều kiện
    @JsonProperty("apply_condition")
    private ConditionRequest applyCondition;

    @Data
    public static class ConditionRequest {
        @JsonProperty("min_value")
        private Double minValue;

        @JsonProperty("product_variant_ids")
        private List<Long> productVariantIds;
    }
}