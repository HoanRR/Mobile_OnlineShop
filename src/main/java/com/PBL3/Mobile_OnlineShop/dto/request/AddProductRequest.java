package com.PBL3.Mobile_OnlineShop.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.*;
import lombok.experimental.FieldDefaults;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class AddProductRequest {
    @NotBlank
    String product_name;

    String brand;
    String product_image_link;
    List<VariantRequest> variants;
}
