package com.PBL3.Mobile_OnlineShop.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class OrderDetailResponse {
    Long order_id;
    Long user_id;
    String order_status;
    String order_date;
    Double total_amount;
    Double discount_amount;
    String payment_method;
    Boolean is_paid;
    Long voucher_id;
    DeliveryInfo delivery;
    List<OrderDetailItemResponse> items;
    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    @FieldDefaults(level = AccessLevel.PRIVATE)
    public static class DeliveryInfo{
        String receiver_name;
        String receiver_phone;
        String shipping_address;
    }

}
