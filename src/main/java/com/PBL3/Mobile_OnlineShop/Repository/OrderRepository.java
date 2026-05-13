package com.PBL3.Mobile_OnlineShop.Repository;

import com.PBL3.Mobile_OnlineShop.dto.response.OrderHistoryResponse;
import com.PBL3.Mobile_OnlineShop.entity.Order;
import com.PBL3.Mobile_OnlineShop.entity.User;
import com.PBL3.Mobile_OnlineShop.enums.OrderStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;


@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {

    @Query("SELECT o FROM Order o WHERE o.user = :user " +
            "AND (:status IS NULL OR o.orderStatus = :status) " +
            "ORDER BY o.orderDate DESC")
    Page<Order> findByUserWithStatusFilter(@Param("user") User user,
                                           @Param("status") OrderStatus status,
                                           Pageable pageable);

    @Query("SELECT o FROM Order o WHERE o.user = :user " +
            "AND (o.orderId = :orderId) ")
    Optional<Order> findByUserWithIdFilter(@Param("user") User user,
                                           @Param("orderId") Long orderId);

    @Query("SELECT COUNT(o), SUM(o.totalAmount) FROM Order o " +
            "WHERE o.orderDate >= :fromDate AND o.orderDate <= :toDate " +
            "AND (:status IS NULL OR o.orderStatus = :status)")
    List<Object[]> getSummaryStatus(@Param("fromDate") LocalDateTime fromDate,
                               @Param("toDate") LocalDateTime toDate,
                               @Param("status") OrderStatus status);

    @Query(value = "SELECT DATE_FORMAT(o.order_date, :sqlFormat) as date, " +
            "SUM(o.total_amount) as revenue, " +
            "COUNT(o.order_id) as orderCount " +
            "FROM `orders` o " +
            "WHERE o.order_date >= :fromDate AND o.order_date <= :toDate " +
            "AND (:statusStr IS NULL OR o.order_status = :statusStr) " +
            "GROUP BY DATE_FORMAT(o.order_date, :sqlFormat) " +
            "ORDER BY date ASC", nativeQuery = true)
    List<ChartProjection> getChartData(@Param("fromDate") LocalDateTime fromDate,
                                       @Param("toDate") LocalDateTime toDate,
                                       @Param("statusStr") String statusStr,
                                       @Param("sqlFormat") String sqlFormat);
}

