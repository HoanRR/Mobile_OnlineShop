package com.PBL3.Mobile_OnlineShop.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@JsonInclude(JsonInclude.Include.NON_NULL)
public class OrderResponse {
    Long order_id;
    String order_status; // PENDING, PROCESSING...
    LocalDateTime order_date;
    String receiver_name;
    String receiver_phone;
    String shipping_address;
    String payment_method;
    Boolean is_paid;
    Long voucher_id;

    Double sub_total; // Tiền hàng
    Double discount_amount; // Tiền giảm giá
    Double total_amount; // Tiền khách phải trả cuối cùng
}