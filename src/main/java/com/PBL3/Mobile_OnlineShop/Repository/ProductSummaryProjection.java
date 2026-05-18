package com.PBL3.Mobile_OnlineShop.Repository;

import java.time.LocalDateTime;

public interface ProductSummaryProjection {
    Long   getProduct_id();
    String getProduct_name();
    String getBrand();
    String getDescription();
    String getProduct_image_link();
    Double getMin_price();
    Double getAvg_rating();
    Long getTotal_reviews();
    LocalDateTime getLatest_review_date();
}
