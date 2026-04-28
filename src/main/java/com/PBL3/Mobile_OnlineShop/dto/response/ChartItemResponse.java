package com.PBL3.Mobile_OnlineShop.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ChartItemResponse {
    String date;

    BigDecimal revenue; // Doanh thu (tiền tệ) nên dùng BigDecimal

    @JsonProperty("order_count")
    Long orderCount;
}
