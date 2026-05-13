package com.PBL3.Mobile_OnlineShop.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class OrderHistoryResponse {
    Long order_id;
    String order_status;
    LocalDateTime order_date;
    Double total_amount;
    Double discount_amount;
    String payment_method;
    Boolean is_paid;
}
