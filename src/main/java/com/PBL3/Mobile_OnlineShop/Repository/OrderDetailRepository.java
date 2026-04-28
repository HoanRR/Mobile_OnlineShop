package com.PBL3.Mobile_OnlineShop.Repository;

import com.PBL3.Mobile_OnlineShop.dto.response.TopProductResponse;
import com.PBL3.Mobile_OnlineShop.entity.OrderDetail;
import com.PBL3.Mobile_OnlineShop.entity.ProductVariant;
import com.PBL3.Mobile_OnlineShop.enums.OrderStatus;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface OrderDetailRepository extends JpaRepository<OrderDetail, Long> {
        boolean existsByProductVariantIn(List<ProductVariant> productVariants);

        boolean existsByOrder_OrderIdAndOrder_User_UserIdAndProductVariant_Product_ProductId(
                        Long orderId,
                        Long userId,
                        Long productId);

        @Query("SELECT COUNT(od) FROM OrderDetail od " +
                        "WHERE od.order.orderDate >= :fromDate AND od.order.orderDate <= :toDate " +
                        "AND (:status IS NULL OR od.order.orderStatus = :status)")
        Long getTotalDevicesSold(@Param("fromDate") LocalDateTime fromDate,
                        @Param("toDate") LocalDateTime toDate,
                        @Param("status") OrderStatus status);

        @Query("SELECT new com.PBL3.Mobile_OnlineShop.dto.response.TopProductResponse(" +
                        "p.productId, p.productName, p.brand, pv.productVariantId, pv.color, pv.storageCapacity, pv.batteryCapacity, "
                        +
                        "COUNT(od.orderDetailId), SUM(od.priceAtPurchase)) " +
                        "FROM OrderDetail od " +
                        "JOIN od.productVariant pv " +
                        "JOIN pv.product p " +
                        "JOIN od.order o " +
                        "WHERE o.orderStatus = :status AND o.isPaid = true " +
                        "AND (:startDate IS NULL OR o.orderDate >= :startDate) " +
                        "AND (:endDate IS NULL OR o.orderDate <= :endDate) " +
                        "AND (:brand IS NULL OR :brand = '' OR p.brand = :brand) " +
                        "GROUP BY p.productId, p.productName, p.brand, pv.productVariantId, pv.color, pv.storageCapacity,pv.batteryCapacity "
                        +
                        "ORDER BY SUM(od.priceAtPurchase) DESC")
        List<TopProductResponse> getTopSellingVariants(
                        @Param("status") OrderStatus status,
                        @Param("startDate") LocalDateTime startDate,
                        @Param("endDate") LocalDateTime endDate,
                        @Param("brand") String brand,
                        Pageable pageable);

        // 2a. Tổng doanh thu theo brand (dùng khi có filter brand)
        @Query("SELECT SUM(od.priceAtPurchase) " +
                        "FROM OrderDetail od " +
                        "JOIN od.productVariant pv " +
                        "JOIN pv.product p " +
                        "JOIN od.order o " +
                        "WHERE o.orderStatus = :status AND o.isPaid = true " +
                        "AND (:startDate IS NULL OR o.orderDate >= :startDate) " +
                        "AND (:endDate IS NULL OR o.orderDate <= :endDate) " +
                        "AND p.brand = :brand")
        Double getTotalRevenueByBrand(
                        @Param("status") OrderStatus status,
                        @Param("startDate") LocalDateTime startDate,
                        @Param("endDate") LocalDateTime endDate,
                        @Param("brand") String brand);

        // 2b. Tổng doanh thu toàn bộ (dùng khi không có filter brand)
        @Query("SELECT SUM(od.priceAtPurchase) " +
                        "FROM OrderDetail od " +
                        "JOIN od.order o " +
                        "WHERE o.orderStatus = :status AND o.isPaid = true " +
                        "AND (:startDate IS NULL OR o.orderDate >= :startDate) " +
                        "AND (:endDate IS NULL OR o.orderDate <= :endDate)")
        Double getTotalRevenueAll(
                        @Param("status") OrderStatus status,
                        @Param("startDate") LocalDateTime startDate,
                        @Param("endDate") LocalDateTime endDate);
}
