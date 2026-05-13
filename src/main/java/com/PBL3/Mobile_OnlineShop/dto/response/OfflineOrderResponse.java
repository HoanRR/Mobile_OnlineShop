package com.PBL3.Mobile_OnlineShop.dto.response;

import com.PBL3.Mobile_OnlineShop.enums.OrderStatus;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@Builder
public class OfflineOrderResponse {

    @JsonProperty("order_id")
    private Long orderId;

    @JsonProperty("order_status")
    private OrderStatus orderStatus;

    @JsonProperty("total_amount")
    private Double totalAmount;

    private List<ItemResponse> items;

    @Getter
    @Setter
    @Builder
    public static class ItemResponse {
        @JsonProperty("order_detail_id")
        private Long orderDetailId;

        @JsonProperty("device_id")
        private Long deviceId;

        private String imei;

        @JsonProperty("price_at_purchase")
        private Double priceAtPurchase;
    }
}