package com.PBL3.Mobile_OnlineShop.repository;

import com.PBL3.Mobile_OnlineShop.entity.Order;
import com.PBL3.Mobile_OnlineShop.enums.OrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface OrderRepository extends JpaRepository<Order, Long> {

        // 1. Dùng OrderStatus (Enum) cho JPQL
        @Query("SELECT COUNT(o), SUM(o.totalAmount) FROM Order o " +
                        "WHERE o.orderDate >= :fromDate AND o.orderDate <= :toDate " +
                        "AND (:status IS NULL OR o.orderStatus = :status)")
        Object[][] getSummaryStats(@Param("fromDate") LocalDateTime fromDate,
                        @Param("toDate") LocalDateTime toDate,
                        @Param("status") OrderStatus status);

        // 2. Dùng OrderStatus (Enum) cho JPQL
        @Query("SELECT COUNT(od) FROM OrderDetail od " +
                        "WHERE od.order.orderDate >= :fromDate AND od.order.orderDate <= :toDate " +
                        "AND (:status IS NULL OR od.order.orderStatus = :status)")
        Long getTotalDevicesSold(@Param("fromDate") LocalDateTime fromDate,
                        @Param("toDate") LocalDateTime toDate,
                        @Param("status") OrderStatus status);

        // 3. Giữ nguyên String cho Native Query (Vì Native SQL đọc dữ liệu text dưới
        // Database)
        @Query(value = "SELECT DATE_FORMAT(o.order_date, :sqlFormat) as date, " +
                        "SUM(o.total_amount) as revenue, " +
                        "COUNT(o.order_id) as orderCount " +
                        "FROM `order` o " +
                        "WHERE o.order_date >= :fromDate AND o.order_date <= :toDate " +
                        "AND (:statusStr IS NULL OR o.order_status = :statusStr) " +
                        "GROUP BY DATE_FORMAT(o.order_date, :sqlFormat) " +
                        "ORDER BY date ASC", nativeQuery = true)
        List<ChartProjection> getChartData(@Param("fromDate") LocalDateTime fromDate,
                        @Param("toDate") LocalDateTime toDate,
                        @Param("statusStr") String statusStr,
                        @Param("sqlFormat") String sqlFormat);
}