package com.PBL3.Mobile_OnlineShop.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
public class WarrantyResponse {
    @JsonProperty("warranty_id")
    private Long warrantyId;

    @JsonProperty("device_id")
    private Long deviceId;

    private String imei;

    @JsonProperty("product_name")
    private String productName;

    private String color;

    @JsonProperty("start_date")
    private LocalDateTime startDate;

    @JsonProperty("end_date")
    private LocalDateTime endDate;

    @JsonProperty("warranty_month")
    private Integer warrantyMonth;

    @JsonProperty("is_valid")
    private Boolean isValid;
}