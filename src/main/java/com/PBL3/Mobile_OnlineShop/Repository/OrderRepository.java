package com.PBL3.Mobile_OnlineShop.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.PBL3.Mobile_OnlineShop.entity.Order;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
}
