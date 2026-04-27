package com.PBL3.Mobile_OnlineShop.controller;

import com.PBL3.Mobile_OnlineShop.Service.VoucherService;
import com.PBL3.Mobile_OnlineShop.dto.request.ValidateVoucherRequest;
import com.PBL3.Mobile_OnlineShop.dto.response.ValidateVoucherResponse;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/vouchers")
@PreAuthorize("hasAuthority('CUSTOMER')")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class VoucherController {

    VoucherService voucherService;

    @PostMapping("/validate")

    public ResponseEntity<ValidateVoucherResponse> validateVoucher(
            @Valid @RequestBody ValidateVoucherRequest request) {
        ValidateVoucherResponse response = voucherService.validateVoucher(request);
        return ResponseEntity.ok(response);
    }
}
