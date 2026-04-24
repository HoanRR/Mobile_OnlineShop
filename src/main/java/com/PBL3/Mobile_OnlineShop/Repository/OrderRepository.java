package com.PBL3.Mobile_OnlineShop.Repository;

import com.PBL3.Mobile_OnlineShop.dto.response.OrderHistoryResponse;
import com.PBL3.Mobile_OnlineShop.entity.Order;
import com.PBL3.Mobile_OnlineShop.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;


@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {

}
