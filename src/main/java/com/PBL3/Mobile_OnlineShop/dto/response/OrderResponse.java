package com.PBL3.Mobile_OnlineShop.dto.response;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class OrderResponse {
    private Long orderId;
    private String orderStatus; // PENDING, PROCESSING...
    private LocalDateTime orderDate;
    private String receiverName;
    private String receiverPhone;
    private String shippingAddress;
    private String paymentMethod;
    private Boolean isPaid;

    private Double subTotal; // Tiền hàng
    private Double discountAmount; // Tiền giảm giá
    private Double totalAmount; // Tiền khách phải trả cuối cùng
}