package com.PBL3.Mobile_OnlineShop.controller.admin;

import com.PBL3.Mobile_OnlineShop.Service.ReportService;
import com.PBL3.Mobile_OnlineShop.dto.response.ReportRevenueResponse;
import com.PBL3.Mobile_OnlineShop.dto.response.TopProductResponse;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

@RestController
@RequestMapping("/api/admin/reports")
@PreAuthorize("hasAuthority('ADMIN')")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class AdminReportController {
    ReportService reportService;
    @GetMapping("/revenue")
    public ResponseEntity<ReportRevenueResponse> ReportRenvenue(
            @RequestParam(required = false) String period,
            @RequestParam(required = false) String from,
            @RequestParam(required = false) String to,
            @RequestParam(defaultValue = "DELIVERED") String order_status
    )
    {
        return ResponseEntity.ok(reportService.ReportRenvenue(period, from, to, order_status));
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
