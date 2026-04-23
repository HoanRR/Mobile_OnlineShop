package com.PBL3.Mobile_OnlineShop.service.impl;

import com.PBL3.Mobile_OnlineShop.dto.response.RevenueReportResponse;
import com.PBL3.Mobile_OnlineShop.dto.response.TopProductResponse;
import com.PBL3.Mobile_OnlineShop.repository.ChartProjection;
import com.PBL3.Mobile_OnlineShop.repository.OrderDetailRepository;
import com.PBL3.Mobile_OnlineShop.repository.OrderRepository;
import com.PBL3.Mobile_OnlineShop.service.ReportService;
import lombok.RequiredArgsConstructor;

import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.stream.Collectors;

import com.PBL3.Mobile_OnlineShop.enums.OrderStatus;
import org.springframework.data.domain.Pageable;
import java.util.Collections;

// Nhớ import AppException và ErrorCode nhé
import com.PBL3.Mobile_OnlineShop.exception.AppException;
import com.PBL3.Mobile_OnlineShop.exception.ErrorCode;

@Service
@RequiredArgsConstructor
public class ReportServiceImpl implements ReportService {

    private final OrderRepository orderRepository;
    private final OrderDetailRepository orderDetailRepository;

    @Override
    public RevenueReportResponse getRevenueReport(String period, String fromDateStr, String toDateStr,
            String orderStatus) {

        LocalDateTime from = LocalDate.parse(fromDateStr).atStartOfDay();
        LocalDateTime to = LocalDate.parse(toDateStr).atTime(LocalTime.MAX);

        OrderStatus statusEnum = null;
        String statusString = null;

        if (orderStatus != null && !orderStatus.equalsIgnoreCase("ALL")) {
            try {
                statusEnum = OrderStatus.valueOf(orderStatus.toUpperCase());
                statusString = statusEnum.name();
            } catch (IllegalArgumentException e) {
                // CMT: Thay RuntimeException bằng AppException (dùng mã VALIDATION_ERROR nhưng
                // truyền message custom)
                throw new AppException(ErrorCode.VALIDATION_ERROR, "Trạng thái đơn hàng không hợp lệ: " + orderStatus);
            }
        }

        // ... (Phần code bên dưới của bạn giữ nguyên y hệt, không cần thay đổi)
        Object[][] summary = orderRepository.getSummaryStats(from, to, statusEnum);
        Long totalOrders = (summary[0][0] != null) ? (Long) summary[0][0] : 0L;
        Double totalRevenue = (summary[0][1] != null) ? (Double) summary[0][1] : 0.0;
        Long totalDevices = orderRepository.getTotalDevicesSold(from, to, statusEnum);
        if (totalDevices == null)
            totalDevices = 0L;

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

        List<ChartProjection> chartData = orderRepository.getChartData(from, to, statusString, sqlFormat);

        List<RevenueReportResponse.ChartDto> chartDtos = chartData.stream()
                .map(c -> RevenueReportResponse.ChartDto.builder()
                        .date(c.getDate()).revenue(c.getRevenue()).orderCount(c.getOrderCount()).build())
                .collect(Collectors.toList());

        return RevenueReportResponse.builder()
                .totalRevenue(totalRevenue)
                .totalOrders(totalOrders)
                .totalDevicesSold(totalDevices)
                .filter(RevenueReportResponse.FilterDto.builder()
                        .from(fromDateStr).to(toDateStr).orderStatus(orderStatus != null ? orderStatus : "DELIVERED")
                        .build())
                .chart(chartDtos)
                .build();
    }

    public List<TopProductResponse> getTopProducts(int limit, LocalDateTime from, LocalDateTime to, String brand) {
        Double totalRevenue = orderDetailRepository.getTotalRevenueForFilters(OrderStatus.DELIVERED, from, to, brand);
        if (totalRevenue == null || totalRevenue == 0)
            return Collections.emptyList();

        Pageable pageable = PageRequest.of(0, limit);
        List<TopProductResponse> topProducts = orderDetailRepository.getTopSellingVariants(OrderStatus.DELIVERED, from,
                to, brand, pageable);

        int currentRank = 1;
        for (TopProductResponse product : topProducts) {
            product.setRank(currentRank++);
            double percentage = (product.getRevenue() / totalRevenue) * 100;
            product.setPercentage(Math.round(percentage * 10.0) / 10.0);
        }
        return topProducts;
    }
}