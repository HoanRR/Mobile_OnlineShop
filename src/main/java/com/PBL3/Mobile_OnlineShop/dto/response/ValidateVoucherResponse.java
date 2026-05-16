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
public class ValidateVoucherResponse {
    boolean valid;

    @JsonProperty("voucher_id")
    Long voucherId;

    @JsonProperty("voucher_code")
    String voucherCode;

    @JsonProperty("discount_percentage")
    Double discountPercentage;

    @JsonProperty("discount_amount")
    Double discountAmount;

    @JsonProperty("final_total")
    Double finalTotal;

    @JsonProperty("end_date")
    String endDate;

    @JsonProperty("usage_limit")
    Long usageLimit;
}
