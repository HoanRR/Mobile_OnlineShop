package com.PBL3.Mobile_OnlineShop.controller.admin;

import com.PBL3.Mobile_OnlineShop.Service.ProductService;
import com.PBL3.Mobile_OnlineShop.dto.request.AddProductRequest;
import com.PBL3.Mobile_OnlineShop.dto.request.ImportDevicesRequest;
import com.PBL3.Mobile_OnlineShop.dto.request.UpdateProductRequest;
import com.PBL3.Mobile_OnlineShop.dto.response.GetDevicesResponse;
import com.PBL3.Mobile_OnlineShop.dto.response.ImportDevicesResponse;
import com.PBL3.Mobile_OnlineShop.dto.response.MessageResponse;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.PBL3.Mobile_OnlineShop.dto.response.ProductDetailResponse;
import java.util.List;

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
    public  ResponseEntity<MessageResponse> AddProduct(@RequestBody AddProductRequest request){
        productService.AddProduct(request);
        return ResponseEntity.ok(MessageResponse.builder()
                        .message("Tạo thành công")
                .build());
    }
    @PatchMapping("/products/{product_id}")
    public ResponseEntity<MessageResponse> UpdateProduct(@PathVariable ("product_id") Long productid, @RequestBody UpdateProductRequest request){
        productService.UpdateProduct(request, productid);
        return ResponseEntity.ok(MessageResponse.builder()
                .message("Cập nhập thành công")
                .build());
    }

    @DeleteMapping("/products/{product_id}")
    public ResponseEntity<MessageResponse> DeleteProduct(@PathVariable("product_id") Long productId) {
        productService.DeleteProduct(productId);
        return ResponseEntity.ok(MessageResponse.builder()
                .message("Xóa sản phẩm thành công")
                .build());
    }

    @GetMapping("/products/all")
    public ResponseEntity<List<ProductDetailResponse>> getAllProductsWithVariants() {
        return ResponseEntity.ok(productService.getAllProductsWithVariants());
    }

    @PostMapping("/products/{product_id}/variants")
    public ResponseEntity<MessageResponse> addVariant(@PathVariable("product_id") Long productId, @RequestBody @Valid com.PBL3.Mobile_OnlineShop.dto.request.VariantRequest request) {
        productService.addVariant(productId, request);
        return ResponseEntity.ok(MessageResponse.builder()
                .message("Thêm biến thể thành công")
                .build());
    }

    @PatchMapping("/variants/{variant_id}")
    public ResponseEntity<MessageResponse> updateVariant(@PathVariable("variant_id") Long variantId, @RequestBody @Valid com.PBL3.Mobile_OnlineShop.dto.request.VariantRequest request) {
        productService.updateVariant(variantId, request);
        return ResponseEntity.ok(MessageResponse.builder()
                .message("Cập nhật biến thể thành công")
                .build());
    }

    @DeleteMapping("/variants/{variant_id}")
    public ResponseEntity<MessageResponse> deleteVariant(@PathVariable("variant_id") Long variantId) {
        productService.deleteVariant(variantId);
        return ResponseEntity.ok(MessageResponse.builder()
                .message("Xóa biến thể thành công")
                .build());
    }
}
