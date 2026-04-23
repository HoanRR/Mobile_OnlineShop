package com.PBL3.Mobile_OnlineShop.repository;

import com.PBL3.Mobile_OnlineShop.dto.response.TopProductResponse;
import com.PBL3.Mobile_OnlineShop.entity.OrderDetail;
import com.PBL3.Mobile_OnlineShop.enums.OrderStatus;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface OrderDetailRepository extends JpaRepository<OrderDetail, Long> {

    // 1. Lấy danh sách Top sản phẩm bán chạy
    @Query("SELECT new com.PBL3.Mobile_OnlineShop.dto.response.TopProductResponse(" +
            "p.productId, p.productName, p.brand, pv.productVariantId, pv.color, pv.storageCapacity, " +
            "COUNT(od.orderDetailId), SUM(od.priceAtPurchase)) " +
            "FROM OrderDetail od " +
            "JOIN od.productVariant pv " +
            "JOIN pv.product p " +
            "JOIN od.order o " +
            "WHERE o.orderStatus = :status AND o.isPaid = true " +
            "AND (:startDate IS NULL OR o.orderDate >= :startDate) " +
            "AND (:endDate IS NULL OR o.orderDate <= :endDate) " +
            "AND (:brand IS NULL OR :brand = '' OR p.brand = :brand) " +
            "GROUP BY p.productId, p.productName, p.brand, pv.productVariantId, pv.color, pv.storageCapacity " +
            "ORDER BY SUM(od.priceAtPurchase) DESC")
    List<TopProductResponse> getTopSellingVariants(
            @Param("status") OrderStatus status,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate,
            @Param("brand") String brand,
            Pageable pageable);

    // 2. Lấy TỔNG doanh thu để tính % Percentage
    @Query("SELECT SUM(od.priceAtPurchase) " +
            "FROM OrderDetail od " +
            "JOIN od.productVariant pv " +
            "JOIN pv.product p " +
            "JOIN od.order o " +
            "WHERE o.orderStatus = :status AND o.isPaid = true " +
            "AND (:startDate IS NULL OR o.orderDate >= :startDate) " +
            "AND (:endDate IS NULL OR o.orderDate <= :endDate) " +
            "AND (:brand IS NULL OR :brand = '' OR p.brand = :brand)")
    Double getTotalRevenueForFilters(
            @Param("status") OrderStatus status,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate,
            @Param("brand") String brand);
}