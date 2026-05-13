package com.PBL3.Mobile_OnlineShop.controller.admin;

import com.PBL3.Mobile_OnlineShop.Service.VoucherService;
import com.PBL3.Mobile_OnlineShop.dto.request.CreateVoucherRequest;
import com.PBL3.Mobile_OnlineShop.dto.request.UpdateVoucherRequest;
import com.PBL3.Mobile_OnlineShop.dto.response.MessageResponse;
import com.PBL3.Mobile_OnlineShop.dto.response.VoucherResponse;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

//api/admin/vouchers/**
@RestController
@RequestMapping("/api/admin/vouchers")
@PreAuthorize("hasAuthority('ADMIN')")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class AdminVoucherController {
    VoucherService voucherService;

    @GetMapping
    public ResponseEntity<List<VoucherResponse>> getAllVouchers() {
        return ResponseEntity.ok(voucherService.getAllVouchers());
    }

    @GetMapping("/{voucher_id}")
    public ResponseEntity<VoucherResponse> getVoucherDetail(@PathVariable Long voucher_id) {
        return ResponseEntity.ok(voucherService.getVoucherDetail(voucher_id));
    }

    @PostMapping
    public ResponseEntity<VoucherResponse> CreatVoucher(@Valid @RequestBody CreateVoucherRequest request) {
        return ResponseEntity.ok(voucherService.CreateVoucher(request));
    }

    @PatchMapping("/{voucher_id}")
    public ResponseEntity<MessageResponse> UpdateVoucher(
            @PathVariable Long voucher_id,
            @RequestBody UpdateVoucherRequest request) {
        voucherService.UpdateVoucher(voucher_id,request);
        return ResponseEntity.ok(MessageResponse.builder().message("Cập nhật thành công").build());
    }

    @PostMapping("/{voucher_id}/extends")
    public ResponseEntity<MessageResponse> ExtendVoucher(
            @PathVariable Long voucher_id,
            @Valid @RequestBody com.PBL3.Mobile_OnlineShop.dto.request.ExtendVoucherRequest request) {
        voucherService.ExtendVoucher(voucher_id, request);
        return ResponseEntity.ok(MessageResponse.builder().message("Gia hạn thành công").build());
    }
}
