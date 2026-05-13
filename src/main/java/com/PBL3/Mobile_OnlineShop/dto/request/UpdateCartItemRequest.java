package com.PBL3.Mobile_OnlineShop.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UpdateCartItemRequest {

    @NotNull(message = "Số lượng không được trống")
    @Min(value = 1, message = "Số lượng tối thiểu phải là 1. Nếu muốn xóa, vui lòng sử dụng chức năng xóa.")
    private Integer quantity;

}