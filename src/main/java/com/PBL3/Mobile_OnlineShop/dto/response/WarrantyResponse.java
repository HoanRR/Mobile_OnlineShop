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
public class WarrantyResponse {
    @JsonProperty("warranty_id")
    Long warrantyId;

    @JsonProperty("start_date")
    LocalDateTime startDate;

    @JsonProperty("end_date")
    LocalDateTime endDate;

    @JsonProperty("warranty_month")
    Integer warrantyMonth;
}