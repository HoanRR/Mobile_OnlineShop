package com.PBL3.Mobile_OnlineShop.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class WarrantyReturnRequest {

    @NotBlank(message = "IMEI không được để trống")
    String imei;

    @NotBlank(message = "Loại yêu cầu không được để trống")
    String type; // "WARRANTY" hoặc "RETURN"

    @NotBlank(message = "Lý do yêu cầu không được để trống")
    String reason;
}
