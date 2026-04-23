package com.PBL3.Mobile_OnlineShop.service;

import java.time.LocalDateTime;
import java.util.List;

import com.PBL3.Mobile_OnlineShop.dto.response.RevenueReportResponse;
import com.PBL3.Mobile_OnlineShop.dto.response.TopProductResponse;

public interface ReportService {
    RevenueReportResponse getRevenueReport(String period, String fromDateStr, String toDateStr, String orderStatus);
    List<TopProductResponse> getTopProducts(int limit, LocalDateTime from, LocalDateTime to, String brand);
}
