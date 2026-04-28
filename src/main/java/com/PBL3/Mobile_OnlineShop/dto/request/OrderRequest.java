package com.PBL3.Mobile_OnlineShop.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class OrderRequest {
    @NotBlank(message = "Tên người nhận không được trống")
    private String receiverName;

    @NotBlank(message = "SĐT không được trống")
    @Pattern(regexp = "^(0|\\+84)[0-9]{9}$", message = "SĐT không hợp lệ")
    private String receiverPhone;

    @NotBlank(message = "Địa chỉ giao hàng không được trống")
    private String shippingAddress;

    @NotBlank(message = "Phương thức thanh toán không được trống")
    private String paymentMethod; // Ví dụ: "COD", "VNPAY", "MOMO"

    private String voucherCode; // Có thể null nếu khách không nhập mã
}