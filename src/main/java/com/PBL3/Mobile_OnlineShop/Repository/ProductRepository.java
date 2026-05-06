package com.PBL3.Mobile_OnlineShop.Repository;

import com.PBL3.Mobile_OnlineShop.entity.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.OptionalInt;

@Repository
public interface ProductRepository  extends JpaRepository<Product, Long> {
    Optional<Product> findByProductName(String productName);
    boolean existsByProductName(String productName);
    Optional<Product> findByProductId(Long productid);

    @Query(value = """
            SELECT 
                p.product_id         AS product_id,
                p.product_name       AS product_name,
                p.brand              AS brand,
                p.product_image_link AS product_image_link,
                MIN(pv.price)                        AS min_price,
                ROUND(AVG(pr.rating), 1)             AS avg_rating
            FROM product p
            LEFT JOIN product_variant pv ON pv.product_id = p.product_id
            LEFT JOIN product_review pr  ON pr.product_id = p.product_id
            WHERE 
                (:brand   IS NULL OR p.brand        LIKE CONCAT('%', :brand,   '%'))
            AND (:keyword IS NULL OR p.product_name LIKE CONCAT('%', :keyword, '%'))
            GROUP BY 
                p.product_id, p.product_name, p.brand, p.product_image_link
            ORDER BY :sortColumn :sortOrder
            LIMIT :limit OFFSET :offset
            """, nativeQuery = true)
    List<ProductSummaryProjection> findAllWithFilters(
            @Param("brand")       String brand,
            @Param("keyword")     String keyword,
            @Param("limit")       int    limit,
            @Param("offset")      int    offset,
            @Param("sortColumn")  String sortColumn,
            @Param("sortOrder")   String sortOrder
    );
    @Query(value = """
            SELECT COUNT(*) FROM (
                SELECT p.product_id
                FROM product p
                LEFT JOIN product_variant pv ON pv.product_id = p.product_id
                LEFT JOIN product_review pr  ON pr.product_id = p.product_id
                WHERE 
                    (:brand   IS NULL OR p.brand        LIKE CONCAT('%', :brand,   '%'))
                AND (:keyword IS NULL OR p.product_name LIKE CONCAT('%', :keyword, '%'))
                GROUP BY p.product_id
            ) AS total
            """, nativeQuery = true)
    long countWithFilters(
            @Param("brand")   String brand,
            @Param("keyword") String keyword
    );

}
