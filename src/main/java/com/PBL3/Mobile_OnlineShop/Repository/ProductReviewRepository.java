package com.PBL3.Mobile_OnlineShop.Repository;

import java.util.List;

import org.springframework.boot.data.autoconfigure.web.DataWebProperties.Pageable;
import org.springframework.data.domain.Page;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.PBL3.Mobile_OnlineShop.entity.ProductReview;

@Repository
public interface ProductReviewRepository extends JpaRepository<ProductReview, Long>{
    boolean existsByUser_UserIdAndProduct_ProductId(Long userId, Long productId);

    // 1. Lấy danh sách có phân trang và Lọc (Filter)
    @Query("SELECT r FROM ProductReview r WHERE r.product.productId = :productId " +
           "AND (:variantId IS NULL OR r.productVariant.productVariantId = :variantId) " +
           "AND (:rating IS NULL OR r.rating = :rating)")
    Page<ProductReview> findReviewsWithFilters(
            @Param("productId") Long productId,
            @Param("variantId") Long variantId,
            @Param("rating") Integer rating,
            org.springframework.data.domain.Pageable pageable);

    // 2. Lấy thống kê Distribution (Đếm số lượng theo từng mức sao của 1 sản phẩm)
    @Query("SELECT r.rating, COUNT(r) FROM ProductReview r WHERE r.product.productId = :productId GROUP BY r.rating")
    List<Object[]> countRatingDistribution(@Param("productId") Long productId);
}
