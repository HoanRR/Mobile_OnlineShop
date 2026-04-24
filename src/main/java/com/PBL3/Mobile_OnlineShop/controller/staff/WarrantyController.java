package com.PBL3.Mobile_OnlineShop.controller.staff;

import com.PBL3.Mobile_OnlineShop.dto.response.WarrantyDetailResponse;
import com.PBL3.Mobile_OnlineShop.Service.WarrantyService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/staff/warranty")
@RequiredArgsConstructor
public class WarrantyController {

    private final WarrantyService warrantyService;

    @GetMapping("/{imei}")
    @PreAuthorize("hasAuthority('EMPLOYEE')")
    public ResponseEntity<WarrantyDetailResponse> checkWarranty(@PathVariable("imei") String imei) {
        WarrantyDetailResponse response = warrantyService.checkWarranty(imei);
        return ResponseEntity.ok(response);
    }
}