package com.PBL3.Mobile_OnlineShop.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ProductViewResponse {
    Long product_id;
    String product_name;
    String brand;
    String product_image_link;
    Double min_price;
    Double avg_rating;


}
