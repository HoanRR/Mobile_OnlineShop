package com.PBL3.Mobile_OnlineShop.repository;

import com.PBL3.Mobile_OnlineShop.entity.ProductVariant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ProductVariantRepository extends JpaRepository<ProductVariant, Long> {
    // Không cần viết gì bên trong cả!
    // Spring Boot đã tự động cung cấp sẵn hàm findAllById(), findById(), save()...
    // cho bạn rồi.
}