package com.PBL3.Mobile_OnlineShop.Repository;

import com.PBL3.Mobile_OnlineShop.entity.Cart;
import com.PBL3.Mobile_OnlineShop.entity.CartDetail;
import com.PBL3.Mobile_OnlineShop.entity.ProductVariant;

import jakarta.transaction.Transactional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CartDetailRepository extends JpaRepository<CartDetail, Long> {
    // Tìm CartDetail dựa vào Giỏ hàng và Phân loại sản phẩm
    Optional<CartDetail> findByCartAndProductVariant(Cart cart, ProductVariant productVariant);

    // Tìm CartDetail dựa vào ID của nó VÀ phải thuộc về đúng Giỏ hàng (Cart) truyền
    // vào
    Optional<CartDetail> findByCartDetailIdAndCart(Long cartDetailId, Cart cart);

    // Xóa toàn bộ chi tiết giỏ hàng thuộc về một Giỏ hàng cụ thể
    @Transactional
    void deleteAllByCart(Cart cart);
}