package com.PBL3.Mobile_OnlineShop.dto.request;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class OfflineOrderRequest {

    @NotBlank(message = "Tên người nhận không được trống")
    @JsonProperty("receiver_name")
    private String receiverName;

    @NotBlank(message = "Số điện thoại không được trống")
    @JsonProperty("receiver_phone")
    private String receiverPhone;

    @NotBlank(message = "Địa chỉ không được trống")
    @JsonProperty("shipping_address")
    private String shippingAddress;

    @NotBlank(message = "Phương thức thanh toán không được trống")
    @JsonProperty("payment_method")
    private String paymentMethod;

    @NotNull(message = "Trạng thái thanh toán không được trống")
    @JsonProperty("is_paid")
    private Boolean isPaid;

    @NotEmpty(message = "Danh sách IMEI không được trống")
    private List<ImeiRequest> items;

    @Getter
    @Setter
    public static class ImeiRequest {
        @NotBlank(message = "IMEI không được trống")
        private String imei;
    }
}