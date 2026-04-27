package com.PBL3.Mobile_OnlineShop.dto.request;

import com.fasterxml.jackson.annotation.JsonInclude;
import jakarta.validation.constraints.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
@JsonInclude(JsonInclude.Include.NON_NULL)
public class OrderRequest {
    @NotBlank(message = "Tên người nhận không được trống")
    private String receiver_name;

    @NotBlank(message = "SĐT không được trống")
    @Pattern(regexp = "^(0|\\+84)[0-9]{9}$")
    private String receiver_phone;

    @NotBlank(message = "Địa chỉ không được trống")
    private String shipping_address;

    @NotBlank(message = "Phương thức thanh toán không được trống")
    private String payment_method;

    private String voucher_code;

    @NotEmpty(message = "Phải chọn ít nhất 1 sản phẩm")
    private List<OrderItemRequest> items;

    @Data
    public static class OrderItemRequest {
        @NotNull
        private Long cart_detail_id;

        @Min(1)
        private Integer quantity;
    }
}