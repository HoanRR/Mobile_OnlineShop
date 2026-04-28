package com.PBL3.Mobile_OnlineShop.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ReportRevenueResponse {
    BigDecimal total_revenue;
    Long total_orders;
    Long total_devices_sold;
    FilterResponse filter;
    List<ChartItemResponse> chart;


}
