package com.PBL3.Mobile_OnlineShop.controller;

import com.PBL3.Mobile_OnlineShop.Service.VoucherService;
import com.PBL3.Mobile_OnlineShop.dto.request.ValidateVoucherRequest;
import com.PBL3.Mobile_OnlineShop.dto.response.ValidateVoucherResponse;
import com.PBL3.Mobile_OnlineShop.dto.response.VoucherResponse;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * VoucherController – các API voucher dành cho CUSTOMER và EMPLOYEE (POS).
 *
 * GET  /api/vouchers                          → danh sách voucher khả dụng (có thể lọc)
 * POST /api/vouchers/validate                 → kiểm tra & tính toán giảm giá trước khi đặt
 */
@RestController
@RequestMapping("/api/vouchers")
@PreAuthorize("hasAnyAuthority('CUSTOMER', 'EMPLOYEE')")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class VoucherController {

    VoucherService voucherService;


    @GetMapping
    public ResponseEntity<List<VoucherResponse>> getAvailableVouchers(
            @RequestParam(required = false) Double orderTotal) {

        List<VoucherResponse> vouchers = voucherService.getAvailableVouchers(orderTotal);
        return ResponseEntity.ok(vouchers);
    }

    /**
     * Kiểm tra mã voucher và tính toán số tiền được giảm trước khi tạo đơn.
     * Trả về discountAmount và finalTotal để frontend hiển thị.
     */
    @PostMapping("/validate")
    public ResponseEntity<ValidateVoucherResponse> validateVoucher(
            @Valid @RequestBody ValidateVoucherRequest request) {

        ValidateVoucherResponse response = voucherService.validateVoucher(request);
        return ResponseEntity.ok(response);
    }
}
