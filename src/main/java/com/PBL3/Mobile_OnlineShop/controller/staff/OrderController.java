package com.PBL3.Mobile_OnlineShop.controller.staff;

import com.PBL3.Mobile_OnlineShop.Service.OrderService;
import com.PBL3.Mobile_OnlineShop.dto.request.OfflineOrderRequest;
import com.PBL3.Mobile_OnlineShop.dto.request.UpdateOrderStatusRequest;
import com.PBL3.Mobile_OnlineShop.dto.response.OfflineOrderResponse;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/staff/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    @PatchMapping("/{order_id}/status")
    @PreAuthorize("hasAuthority('EMPLOYEE')")
    public ResponseEntity<String> updateOrderStatus(
            @PathVariable("order_id") Long orderId,
            @Valid @RequestBody UpdateOrderStatusRequest request) {

        orderService.updateStatus(orderId, request);

        // Trả về HTTP 200 OK
        return ResponseEntity.ok("Cập nhật thành công");
    }

    @PostMapping("/offline")
    @PreAuthorize("hasAuthority('EMPLOYEE')")
    public ResponseEntity<OfflineOrderResponse> createOfflineOrder(
            @Valid @RequestBody OfflineOrderRequest request) {

        OfflineOrderResponse response = orderService.createOfflineOrder(request);

        // Trả về HTTP Status 201 CREATED theo đúng chuẩn RESTful
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
}