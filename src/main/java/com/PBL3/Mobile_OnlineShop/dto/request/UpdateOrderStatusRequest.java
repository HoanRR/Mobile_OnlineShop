package com.PBL3.Mobile_OnlineShop.dto.request;

import com.PBL3.Mobile_OnlineShop.enums.OrderStatus;
import com.fasterxml.jackson.annotation.JsonProperty;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateOrderStatusRequest {
    @NotNull(message = "Trạng thái không được để trống")
    @JsonProperty("order_status")
    private OrderStatus orderStatus;

    @JsonProperty("is_paid")
    private Boolean isPaid;
}
