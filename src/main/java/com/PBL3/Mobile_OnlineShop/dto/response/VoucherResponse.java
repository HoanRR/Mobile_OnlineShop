package com.PBL3.Mobile_OnlineShop.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Builder
public class VoucherResponse {
    @JsonProperty("voucher_id")
    private Long voucherId;

    @JsonProperty("voucher_code")
    private String voucherCode;

    @JsonProperty("discount_percentage")
    private Double discountPercentage;

    @JsonProperty("max_discount_amount")
    private Double maxDiscountAmount;

    @JsonProperty("start_date")
    private LocalDateTime startDate;

    @JsonProperty("end_date")
    private LocalDateTime endDate;

    @JsonProperty("usage_limit")
    private Long usageLimit;
}