package com.PBL3.Mobile_OnlineShop.dto.request;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.awt.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class VariantRequest {
    String color;
    Long storage_capacity;
    Long battery_capacity;
    String resolution;
    String chip;
    String ram;
    Double price;
    Long total_available;
    String variant_image_link;
}
