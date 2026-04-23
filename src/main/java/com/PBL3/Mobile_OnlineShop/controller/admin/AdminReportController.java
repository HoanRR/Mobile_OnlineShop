package com.PBL3.Mobile_OnlineShop.controller.admin;

import com.PBL3.Mobile_OnlineShop.dto.response.RevenueReportResponse;
import com.PBL3.Mobile_OnlineShop.dto.response.TopProductResponse;
import com.PBL3.Mobile_OnlineShop.service.ReportService;

import lombok.RequiredArgsConstructor;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

@RestController
@RequestMapping("/api/admin/reports")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AdminReportController {

    private final ReportService reportService;

    @GetMapping("/revenue")
    public ResponseEntity<RevenueReportResponse> getRevenueReport(
            @RequestParam(defaultValue = "day") String period,
            @RequestParam String from,
            @RequestParam String to,
            @RequestParam(defaultValue = "DELIVERED") String order_status) {

        RevenueReportResponse response = reportService.getRevenueReport(period, from, to, order_status);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/top-products")
    public ResponseEntity<List<TopProductResponse>> getTopProducts(
            @RequestParam(defaultValue = "10") int limit,
            @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate to,
            @RequestParam(required = false) String brand) {

        LocalDateTime fromDateTime = (from != null) ? from.atStartOfDay() : null;
        LocalDateTime toDateTime = (to != null) ? to.atTime(LocalTime.MAX) : null;

        List<TopProductResponse> response = reportService.getTopProducts(limit, fromDateTime, toDateTime, brand);
        return ResponseEntity.ok(response);
    }
}