package com.PBL3.Mobile_OnlineShop.dto.response;

import lombok.Data;
import java.util.List;

@Data
public class CartResponse {
    private Long cartId;
    private List<CartDetailResponse> items;
    private Double cartTotal; // Tổng tiền tạm tính của cả giỏ (Backend tự tính rồi trả về)
}
