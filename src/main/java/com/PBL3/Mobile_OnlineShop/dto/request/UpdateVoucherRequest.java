package com.PBL3.Mobile_OnlineShop.dto.request;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UpdateVoucherRequest {
    String voucher_code;
    Double discount_percentage;
    String start_date;
    String end_date;
    Long usage_limit;
    ApplyConditionRequest apply_condition;
}
