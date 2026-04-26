package com.PBL3.Mobile_OnlineShop.Service;

import com.PBL3.Mobile_OnlineShop.Exeption.AppException;
import com.PBL3.Mobile_OnlineShop.Exeption.ErrorCode;
import com.PBL3.Mobile_OnlineShop.Repository.ChartProjection;
import com.PBL3.Mobile_OnlineShop.Repository.OrderDetailRepository;
import com.PBL3.Mobile_OnlineShop.Repository.OrderRepository;
import com.PBL3.Mobile_OnlineShop.dto.response.ChartItemResponse;
import com.PBL3.Mobile_OnlineShop.dto.response.FilterResponse;
import com.PBL3.Mobile_OnlineShop.dto.response.ReportRevenueResponse;
import com.PBL3.Mobile_OnlineShop.dto.response.TopProductResponse;
import com.PBL3.Mobile_OnlineShop.enums.OrderStatus;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ReportService {
    OrderRepository orderRepository;
    OrderDetailRepository orderDetailRepository;

    public ReportRevenueResponse ReportRenvenue(String period, String fromDateStr, String toDateStr,
            String order_status) {
        LocalDateTime from = LocalDate.parse(fromDateStr).atStartOfDay();
        LocalDateTime to = LocalDate.parse(toDateStr).atTime(LocalTime.MAX);

        OrderStatus statusEnum = null;
        String statusString = null;

        if (order_status != null && !order_status.equalsIgnoreCase("ALL")) {
            try {
                statusEnum = OrderStatus.valueOf(order_status.toUpperCase());
                statusString = statusEnum.name();
            } catch (IllegalArgumentException e) {
                throw new AppException(ErrorCode.VALIDATION_ERROR, "Trạng thái đơn hàng không hợp lệ: " + order_status);
            }
        }

        List<Object[]> summary = orderRepository.getSummaryStatus(from, to, statusEnum);
        Long total_orders = (summary != null && !summary.isEmpty() && summary.get(0)[0] != null)
                ? (Long) summary.get(0)[0]
                : 0L;
        BigDecimal total_revenue = (summary != null && !summary.isEmpty() && summary.get(0)[1] != null)
                ? BigDecimal.valueOf((Double) summary.get(0)[1])
                : BigDecimal.ZERO;
        Long total_sold = orderDetailRepository.getTotalDevicesSold(from, to, statusEnum);
        if (total_sold == null) {
            total_sold = 0L;
        }

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
        List<ChartItemResponse> chartDtos = chartData.stream()
                .map(c -> ChartItemResponse.builder()
                        .date(c.getDate())
                        .revenue(c.getRevenue())
                        .orderCount(c.getOrderCount())
                        .build())
                .collect(Collectors.toList());
        return ReportRevenueResponse.builder()
                .total_revenue(total_revenue)
                .total_orders(total_orders)
                .total_devices_sold(total_sold)
                .filter(FilterResponse.builder()
                        .from(fromDateStr).to(toDateStr)
                        .order_status(order_status != null ? order_status : "DELIVERED")
                        .build())
                .chart(chartDtos)
                .build();
    }

    public List<TopProductResponse> getTopProducts(int limit, LocalDateTime from, LocalDateTime to, String brand) {

        boolean hasBrand = brand != null && !brand.trim().isEmpty();

        Double totalRevenue = hasBrand
                ? orderDetailRepository.getTotalRevenueByBrand(OrderStatus.DELIVERED, from, to, brand)
                : orderDetailRepository.getTotalRevenueAll(OrderStatus.DELIVERED, from, to);

        if (totalRevenue == null || totalRevenue == 0)
            return Collections.emptyList();

        Pageable pageable = PageRequest.of(0, limit);
        List<TopProductResponse> topProducts = orderDetailRepository.getTopSellingVariants(
                OrderStatus.DELIVERED, from, to, hasBrand ? brand : null, pageable);

        int currentRank = 1;
        for (TopProductResponse product : topProducts) {
            product.setRank(currentRank++);
            double percentage = product.getRevenue()
                    .divide(BigDecimal.valueOf(totalRevenue), 6, java.math.RoundingMode.HALF_UP)
                    .multiply(BigDecimal.valueOf(100))
                    .doubleValue();
            product.setPercentage(Math.round(percentage * 10.0) / 10.0);
        }
        return topProducts;
    }
}
