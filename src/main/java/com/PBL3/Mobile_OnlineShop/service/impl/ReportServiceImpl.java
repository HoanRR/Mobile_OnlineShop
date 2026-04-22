package com.PBL3.Mobile_OnlineShop.service.impl;

import com.PBL3.Mobile_OnlineShop.dto.response.RevenueReportResponse;
import com.PBL3.Mobile_OnlineShop.repository.ChartProjection;
import com.PBL3.Mobile_OnlineShop.repository.OrderRepository;
import com.PBL3.Mobile_OnlineShop.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.stream.Collectors;

import com.PBL3.Mobile_OnlineShop.enums.OrderStatus;

@Service
@RequiredArgsConstructor
public class ReportServiceImpl implements ReportService {

    private final OrderRepository orderRepository;

    @Override
    public RevenueReportResponse getRevenueReport(String period, String fromDateStr, String toDateStr,
            String orderStatus) {

        LocalDateTime from = LocalDate.parse(fromDateStr).atStartOfDay();
        LocalDateTime to = LocalDate.parse(toDateStr).atTime(LocalTime.MAX);

        // --- ĐOẠN SỬA MỚI ---
        OrderStatus statusEnum = null;
        String statusString = null;

        if (orderStatus != null && !orderStatus.equalsIgnoreCase("ALL")) {
            try {
                // Ép chuỗi "DELIVERED" thành Enum OrderStatus.DELIVERED
                statusEnum = OrderStatus.valueOf(orderStatus.toUpperCase());
                statusString = statusEnum.name();
            } catch (IllegalArgumentException e) {
                throw new RuntimeException("Trạng thái đơn hàng không hợp lệ: " + orderStatus);
            }
        }
        // --------------------

        // 3. Truy vấn các chỉ số tổng quan (Truyền statusEnum vào đây)
        Object[][] summary = orderRepository.getSummaryStats(from, to, statusEnum);
        Long totalOrders = (summary[0][0] != null) ? (Long) summary[0][0] : 0L;
        Double totalRevenue = (summary[0][1] != null) ? (Double) summary[0][1] : 0.0;

        Long totalDevices = orderRepository.getTotalDevicesSold(from, to, statusEnum); // Truyền statusEnum
        if (totalDevices == null)
            totalDevices = 0L;

        // ... (Đoạn switch-case sqlFormat giữ nguyên) ...
        String sqlFormat;
        switch (period.toLowerCase()) {
            case "month":
                sqlFormat = "%Y-%m";
                break;
            case "year":
                sqlFormat = "%Y";
                break;
            case "day":
            default:
                sqlFormat = "%Y-%m-%d";
                break;
        }

        // 5. Lấy dữ liệu Biểu đồ (Truyền statusString vào đây vì là Native Query)
        List<ChartProjection> chartData = orderRepository.getChartData(from, to, statusString, sqlFormat);

        List<RevenueReportResponse.ChartDto> chartDtos = chartData.stream()
                .map(c -> RevenueReportResponse.ChartDto.builder()
                        .date(c.getDate())
                        .revenue(c.getRevenue())
                        .orderCount(c.getOrderCount())
                        .build())
                .collect(Collectors.toList());

        // 6. Build trả về kết quả
        return RevenueReportResponse.builder()
                .totalRevenue(totalRevenue)
                .totalOrders(totalOrders)
                .totalDevicesSold(totalDevices)
                .filter(RevenueReportResponse.FilterDto.builder()
                        .from(fromDateStr)
                        .to(toDateStr)
                        .orderStatus(orderStatus != null ? orderStatus : "DELIVERED")
                        .build())
                .chart(chartDtos)
                .build();
    }
}