package com.PBL3.Mobile_OnlineShop.controller;

import com.PBL3.Mobile_OnlineShop.dto.request.AddToCartRequest;
import com.PBL3.Mobile_OnlineShop.dto.request.UpdateCartItemRequest;
import com.PBL3.Mobile_OnlineShop.dto.response.CartResponse;

import jakarta.validation.Valid;

import com.PBL3.Mobile_OnlineShop.Service.CartService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.Map;

@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
public class CartController {

    private final CartService cartService;

    @GetMapping
    @PreAuthorize("hasAuthority('CUSTOMER')") // hiện tại theo thiết kế chỉ có customer có giỏ hàng
    public ResponseEntity<CartResponse> getMyCart() {
        CartResponse response = cartService.getMyCart();
        return ResponseEntity.ok(response);
    }

    @PostMapping("/items")
    @PreAuthorize("hasAuthority('CUSTOMER')")
    public ResponseEntity<Map<String, String>> addToCart(@Valid @RequestBody AddToCartRequest request) {

        cartService.addToCart(request);

        // Trả về JSON message đơn giản
        return ResponseEntity.ok(Map.of("message", "Đã thêm vào giỏ hàng thành công"));
    }

    @PatchMapping("/items/{cart_detail_id}")
    @PreAuthorize("hasAuthority('CUSTOMER')")
    public ResponseEntity<Map<String, String>> updateCartItemQuantity(
            @PathVariable("cart_detail_id") Long cartDetailId,
            @Valid @RequestBody UpdateCartItemRequest request) {

        cartService.updateCartItemQuantity(cartDetailId, request);

        return ResponseEntity.ok(Map.of("message", "Cập nhật số lượng thành công"));
    }

    @DeleteMapping("/items/{cart_detail_id}")
    @PreAuthorize("hasAuthority('CUSTOMER')")
    public ResponseEntity<Map<String, String>> removeCartItem(
            @PathVariable("cart_detail_id") Long cartDetailId) {

        cartService.removeCartItem(cartDetailId);

        return ResponseEntity.ok(Map.of("message", "Đã xóa sản phẩm khỏi giỏ hàng"));
    }

    @DeleteMapping
    @PreAuthorize("hasAuthority('CUSTOMER')")
    public ResponseEntity<Map<String, String>> clearCart() {

        cartService.clearCart();

        return ResponseEntity.ok(Map.of("message", "Giỏ hàng đã được xóa"));
    }
}