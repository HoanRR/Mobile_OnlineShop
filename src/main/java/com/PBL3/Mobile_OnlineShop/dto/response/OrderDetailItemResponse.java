package com.PBL3.Mobile_OnlineShop.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class OrderDetailItemResponse {
    Long order_detail_id;
    Long variant_id;
    Long device_id;
    String imei;
    String product_name;
    String color;
    Long storage_capacity;
    Double price_at_purchase;
}
