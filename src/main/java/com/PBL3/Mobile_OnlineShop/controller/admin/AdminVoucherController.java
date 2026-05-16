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

//api/admin/vouchers/**
@RestController
@RequestMapping("/api/admin/vouchers")
@PreAuthorize("hasAuthority('ADMIN')")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class AdminVoucherController {
    VoucherService voucherService;

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
}
