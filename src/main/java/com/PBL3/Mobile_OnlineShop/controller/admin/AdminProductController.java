package com.PBL3.Mobile_OnlineShop.controller.admin;

import com.PBL3.Mobile_OnlineShop.Service.ProductService;
import com.PBL3.Mobile_OnlineShop.dto.request.AddProductRequest;
import com.PBL3.Mobile_OnlineShop.dto.request.ImportDevicesRequest;
import com.PBL3.Mobile_OnlineShop.dto.response.GetDevicesResponse;
import com.PBL3.Mobile_OnlineShop.dto.response.ImportDevicesResponse;
import com.PBL3.Mobile_OnlineShop.dto.response.MessageResponse;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

// api/admin/products, devices
@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasAuthority('ADMIN')")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class AdminProductController {
    ProductService productService;
    @PostMapping("/devices/import")
    public ResponseEntity<ImportDevicesResponse> devicesImport(@Valid @RequestBody ImportDevicesRequest request){
        ImportDevicesResponse importDevicesResponse = productService.importDevices(request);
        return ResponseEntity.ok(importDevicesResponse);
    }

    @GetMapping("/devices/{imei}")
    public ResponseEntity<GetDevicesResponse> getDevices(@PathVariable("imei") String imei){
        GetDevicesResponse getDevicesResponse = productService.GetDevices(imei);
        return ResponseEntity.ok(getDevicesResponse);
    }
    @PostMapping("/products")
    public  ResponseEntity<MessageResponse> AddProduct(AddProductRequest request){
        productService.AddProduct(request);
        return ResponseEntity.ok(MessageResponse.builder()
                        .message("Tạo thành công")
                .build());
    }
}
