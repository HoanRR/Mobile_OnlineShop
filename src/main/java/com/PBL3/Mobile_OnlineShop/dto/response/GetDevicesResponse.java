package com.PBL3.Mobile_OnlineShop.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@JsonInclude(JsonInclude.Include.NON_NULL)
public class GetDevicesResponse {
    Long deviceId;
    String imei;
    String status;
    long productVariantId;
    String productName;
    String color;

    warratyInfo warratyInfo;
    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    @FieldDefaults(level = AccessLevel.PRIVATE)
    public static class warratyInfo{
        @JsonProperty("warrantyId")
        Long warrantyId;
        LocalDateTime  startDate;
        LocalDateTime  endDate;
        int warrantyMonth;
    }
}
