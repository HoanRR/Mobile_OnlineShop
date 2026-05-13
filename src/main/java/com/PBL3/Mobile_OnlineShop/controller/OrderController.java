package com.PBL3.Mobile_OnlineShop.controller;

import com.PBL3.Mobile_OnlineShop.Service.OrderService;
import com.PBL3.Mobile_OnlineShop.dto.request.OrderRequest;
import com.PBL3.Mobile_OnlineShop.dto.response.*;
import jakarta.validation.Valid;
import jakarta.websocket.server.PathParam;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PostAuthorize;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

// api/orders/**
@RestController
@RequestMapping("/api/orders")
@PreAuthorize("hasAuthority('CUSTOMER')")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class OrderController {

    OrderService orderService;
    @GetMapping
    public ResponseEntity<PaginatedResponse<OrderHistoryResponse>> getMyOrders(
            @RequestParam(required = false) String order_status,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int limit) {

        PaginatedResponse<OrderHistoryResponse> response =
                orderService.getMyOrders(order_status, page, limit);
        return ResponseEntity.ok(response);
    }
    @GetMapping("/{order_id}")
    public ResponseEntity<OrderDetailResponse> GetOrderDetail(@PathVariable Long order_id){
        return ResponseEntity.ok(orderService.GetOrderDetail(order_id));
    }
    @PostMapping
    public ResponseEntity<OrderResponse> createOrder(
            @Valid @RequestBody OrderRequest request) {

        OrderResponse response = orderService.createOrder(request);
        return ResponseEntity.ok(response);
    }
}
