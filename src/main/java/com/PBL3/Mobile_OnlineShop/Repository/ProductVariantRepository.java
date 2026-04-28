package com.PBL3.Mobile_OnlineShop.Repository;

import com.PBL3.Mobile_OnlineShop.entity.ProductVariant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ProductVariantRepository extends JpaRepository<ProductVariant, Long> {
    ProductVariant findByProductVariantId(long productVariantId);
}
