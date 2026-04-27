package com.PBL3.Mobile_OnlineShop.Repository;

public interface ProductSummaryProjection {
    Long   getProduct_id();
    String getProduct_name();
    String getBrand();
    String getProduct_image_link();
    Double getMin_price();
    Double getAvg_rating();
}
