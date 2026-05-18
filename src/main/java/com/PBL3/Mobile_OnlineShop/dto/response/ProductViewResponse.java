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
    String description;
    String product_image_link;
    Double min_price;
    Double avg_rating;
    Long total_reviews;
    String latest_review_date;

}
