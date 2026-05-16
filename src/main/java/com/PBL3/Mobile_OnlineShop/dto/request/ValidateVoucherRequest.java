package com.PBL3.Mobile_OnlineShop.dto.request;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ValidateVoucherRequest {

    @NotBlank(message = "Mã voucher không được trống")
    @JsonProperty("voucher_code")
    String voucherCode;

    @NotNull(message = "Tổng đơn hàng không được trống")
    @Positive(message = "Tổng đơn hàng phải lớn hơn 0")
    @JsonProperty("order_total")
    Double orderTotal;
}
