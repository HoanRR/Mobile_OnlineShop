package com.PBL3.Mobile_OnlineShop.dto.request;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonProperty;

@Data
public class VoucherExtendRequest {

    @NotNull(message = "Ngày kết thúc không được để trống")
    @Future(message = "Ngày kết thúc phải là một thời điểm trong tương lai")
    @JsonProperty("end_date")
    private LocalDateTime endDate;

    @Min(value = 0, message = "Giới hạn sử dụng không được nhỏ hơn 0")
    @JsonProperty("usage_limit")
    private Long usageLimit;
}