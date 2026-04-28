package com.PBL3.Mobile_OnlineShop.Repository;

import java.math.BigDecimal;

public interface ChartProjection {
    String getDate();
    BigDecimal getRevenue();
    Long getOrderCount();
}
