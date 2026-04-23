package com.PBL3.Mobile_OnlineShop.Repository;

import com.PBL3.Mobile_OnlineShop.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.OptionalInt;

@Repository
public interface ProductRepository  extends JpaRepository<Product, Long> {
    Optional<Product> findByProductName(String productName);
    boolean existsByProductName(String productName);
}
