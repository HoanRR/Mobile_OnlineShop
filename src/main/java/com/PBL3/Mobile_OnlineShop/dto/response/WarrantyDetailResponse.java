package com.PBL3.Mobile_OnlineShop.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class WarrantyDetailResponse {
    @JsonProperty("warranty_id")
    Long warrantyId;

    @JsonProperty("device_id")
    Long deviceId;

    String imei;

    @JsonProperty("product_name")
    String productName;

    String color;

    @JsonProperty("start_date")
    LocalDateTime startDate;

    @JsonProperty("end_date")
    LocalDateTime endDate;

    @JsonProperty("warranty_month")
    Integer warrantyMonth;

    @JsonProperty("is_valid")
    Boolean isValid;
}
