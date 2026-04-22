package com.PBL3.Mobile_OnlineShop.repository;

public interface ChartProjection {
    String getDate(); // Hứng chuỗi ngày/tháng gom nhóm

    Double getRevenue(); // Hứng tổng doanh thu

    Long getOrderCount(); // Hứng tổng số đơn
}