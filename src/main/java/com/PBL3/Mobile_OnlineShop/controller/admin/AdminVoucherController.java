package com.PBL3.Mobile_OnlineShop.controller.admin;

import com.PBL3.Mobile_OnlineShop.dto.request.VoucherCreateRequest;
import com.PBL3.Mobile_OnlineShop.dto.request.VoucherExtendRequest;
import com.PBL3.Mobile_OnlineShop.dto.response.VoucherResponse;
import com.PBL3.Mobile_OnlineShop.service.VoucherService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/vouchers")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AdminVoucherController {

    private final VoucherService voucherService;

    @PostMapping
    public ResponseEntity<VoucherResponse> createVoucher(
            @Valid @RequestBody VoucherCreateRequest request) {

        VoucherResponse response = voucherService.createVoucher(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PatchMapping("/{voucherId}/extend")
    public ResponseEntity<String> extendVoucher(
            @PathVariable Long voucherId,
            @Valid @RequestBody VoucherExtendRequest request) {

        voucherService.extendVoucher(voucherId, request);
        return ResponseEntity.ok("Gia hạn thành công");
    }
}