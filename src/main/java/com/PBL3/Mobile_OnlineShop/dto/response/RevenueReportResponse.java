package com.PBL3.Mobile_OnlineShop.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Builder;
import lombok.Data;
import java.util.List;

@Data
@Builder
public class RevenueReportResponse {
    @JsonProperty("total_revenue")
    private Double totalRevenue;

    @JsonProperty("total_orders")
    private Long totalOrders;

    @JsonProperty("total_devices_sold")
    private Long totalDevicesSold;

    private FilterDto filter;
    private List<ChartDto> chart;

    @Data
    @Builder
    public static class FilterDto {
        private String from;
        private String to;
        @JsonProperty("order_status")
        private String orderStatus;
    }

    @Data
    @Builder
    public static class ChartDto {
        private String date;
        private Double revenue;
        @JsonProperty("order_count")
        private Long orderCount;
    }
}