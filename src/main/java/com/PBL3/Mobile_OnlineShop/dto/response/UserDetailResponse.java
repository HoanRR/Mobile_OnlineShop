package com.PBL3.Mobile_OnlineShop.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class UserDetailResponse {
    @JsonProperty("user_id")
    private Long userId;

    private String username;
    private String email;

    @JsonProperty("phone_number")
    private String phoneNumber;

    private String role;

    @JsonProperty("order_history")
    private List<OrderHistoryDto> orderHistory;

    // Class con chứa thông tin rút gọn của Đơn hàng
    @Data
    @Builder
    public static class OrderHistoryDto {
        @JsonProperty("order_id")
        private Long orderId;

        @JsonProperty("order_status")
        private String orderStatus;

        @JsonProperty("total_amount")
        private Double totalAmount;
        @JsonProperty("order_date")
        private LocalDateTime orderDate;
    }
}