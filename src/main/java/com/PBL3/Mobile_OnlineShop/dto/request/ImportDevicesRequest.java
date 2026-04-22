package com.PBL3.Mobile_OnlineShop.dto.request;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ImportDevicesRequest {
    long product_variant_id;
    List<String> imei_list;
}
