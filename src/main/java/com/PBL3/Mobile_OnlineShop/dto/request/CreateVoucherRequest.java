package com.PBL3.Mobile_OnlineShop.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.*;
import lombok.experimental.FieldDefaults;
import lombok.experimental.SuperBuilder;

@Data
@NoArgsConstructor
@SuperBuilder
@FieldDefaults(level = AccessLevel.PRIVATE)
@EqualsAndHashCode(callSuper = true)
public class CreateVoucherRequest extends BaseVoucherRequest {

    @NotNull(message = "Thiếu thông tin voucher code")
    String voucher_code;

    @NotNull(message = "Thiếu thông tin phần trăm giảm giá")
    Double discount_percentage;

    @NotNull(message = "Thiếu thông tin ngày bắt đầu")
    String start_date;

    @NotNull(message = "Thiếu thông tin ngày kết thúc")
    String end_date;

    @NotNull(message = "Thiếu thông tin giới hạn lượt dùng")
    Long usage_limit;
}
