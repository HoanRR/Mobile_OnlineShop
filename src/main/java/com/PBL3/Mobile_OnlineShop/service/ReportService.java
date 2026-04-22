package com.PBL3.Mobile_OnlineShop.service;

import com.PBL3.Mobile_OnlineShop.dto.response.RevenueReportResponse;

public interface ReportService {
    RevenueReportResponse getRevenueReport(String period, String fromDateStr, String toDateStr, String orderStatus);
}
