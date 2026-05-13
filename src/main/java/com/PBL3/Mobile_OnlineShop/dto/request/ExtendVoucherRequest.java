package com.PBL3.Mobile_OnlineShop.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ExtendVoucherRequest {
    @NotNull(message = "Thiếu ngày kết thúc mới")
    String new_end_date;
}
