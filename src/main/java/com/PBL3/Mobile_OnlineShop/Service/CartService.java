package com.PBL3.Mobile_OnlineShop.Service;

import com.PBL3.Mobile_OnlineShop.Exeption.AppException;
import com.PBL3.Mobile_OnlineShop.Exeption.ErrorCode;
import com.PBL3.Mobile_OnlineShop.dto.request.AddToCartRequest;
import com.PBL3.Mobile_OnlineShop.dto.request.UpdateCartItemRequest;
import com.PBL3.Mobile_OnlineShop.dto.response.CartResponse;
import com.PBL3.Mobile_OnlineShop.entity.Cart;
import com.PBL3.Mobile_OnlineShop.entity.CartDetail;
import com.PBL3.Mobile_OnlineShop.entity.ProductVariant;
import com.PBL3.Mobile_OnlineShop.entity.User;
import com.PBL3.Mobile_OnlineShop.Repository.CartDetailRepository;
import com.PBL3.Mobile_OnlineShop.Repository.CartRepository;
import com.PBL3.Mobile_OnlineShop.Repository.ProductVariantRepository;
import com.PBL3.Mobile_OnlineShop.Repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.Optional;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CartService {

    private final CartRepository cartRepository;
    private final UserRepository userRepository;
    private final ProductVariantRepository productVariantRepository;
    private final CartDetailRepository cartDetailRepository;

    @Transactional
    public CartResponse getMyCart() {
        // 1. Lấy thông tin User đang đăng nhập từ Token
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByUsername(username) // Đổi tên hàm này theo code của bạn (ví dụ: findByEmail)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        // 2. Tìm giỏ hàng của User
        Cart cart = cartRepository.findByUser(user).orElse(null);

        // 3. Nếu chưa có giỏ hàng -> Tạo giỏ hàng rỗng tuếch lưu vào DB
        if (cart == null) {
            cart = new Cart();
            cart.setUser(user);
            cart.setUpdatedAt(LocalDateTime.now());
            cart = cartRepository.save(cart);

            // Trả về Giỏ hàng rỗng
            return CartResponse.builder()
                    .cartId(cart.getCartId())
                    .userId(user.getUserId())
                    .updatedAt(cart.getUpdatedAt())
                    .items(new ArrayList<>())
                    .total(0.0)
                    .build();
        }

        // 4. Nếu có giỏ hàng -> Tính tổng tiền và map dữ liệu
        double total = 0.0;
        List<CartResponse.CartItemResponse> itemResponses = new ArrayList<>();

        if (cart.getCartDetails() != null) {
            for (CartDetail detail : cart.getCartDetails()) {
                var variant = detail.getProductVariant();
                var product = variant.getProduct();

                // Tính tổng tiền động (realtime)
                total += detail.getQuantity() * variant.getPrice();

                // Map VariantDto
                CartResponse.VariantDto variantDto = CartResponse.VariantDto.builder()
                        .productVariantId(variant.getProductVariantId())
                        .productName(product.getProductName()) // Tên SP lấy từ bảng Product
                        .color(variant.getColor())
                        .storageCapacity(variant.getStorageCapacity())
                        .price(variant.getPrice())
                        .totalAvailable(variant.getTotalAvailable())
                        .variantImageLink(variant.getVariantImageLink())
                        .build();

                // Map CartItem
                itemResponses.add(CartResponse.CartItemResponse.builder()
                        .cartDetailId(detail.getCartDetailId())
                        .quantity(detail.getQuantity())
                        .variant(variantDto)
                        .build());
            }
        }

        // 5. Trả về kết quả
        return CartResponse.builder()
                .cartId(cart.getCartId())
                .userId(user.getUserId())
                .updatedAt(cart.getUpdatedAt())
                .items(itemResponses)
                .total(total)
                .build();
    }

    @Transactional
    public void addToCart(AddToCartRequest request) {
        // 1. Lấy User đang đăng nhập
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        // 2. Tìm hoặc Tạo mới Giỏ hàng rỗng (Nếu chưa có)
        Cart cart = cartRepository.findByUser(user).orElseGet(() -> {
            Cart newCart = new Cart();
            newCart.setUser(user);
            return cartRepository.save(newCart);
        });

        // 3. Kiểm tra sản phẩm có tồn tại không?
        ProductVariant variant = productVariantRepository.findById(request.getProductVariantId())
                .orElseThrow(() -> new AppException(ErrorCode.VARIANT_NOT_FOUND));

        // 4. Kiểm tra Tồn kho lần 1 (Số lượng yêu cầu > Số lượng trong kho)
        if (variant.getTotalAvailable() < request.getQuantity()) {
            throw new AppException(ErrorCode.OUT_OF_STOCK);
        }

        // 5. Kiểm tra xem sản phẩm này đã có trong Giỏ hàng chưa
        Optional<CartDetail> existingDetailOpt = cartDetailRepository.findByCartAndProductVariant(cart, variant);

        if (existingDetailOpt.isPresent()) {
            // Trường hợp ĐÃ CÓ SẴN -> Cộng dồn số lượng
            CartDetail existingDetail = existingDetailOpt.get();
            int newQuantity = existingDetail.getQuantity() + request.getQuantity();

            // Kiểm tra Tồn kho lần 2 (Tổng số lượng sau khi cộng dồn có vượt quá kho
            // không?)
            if (variant.getTotalAvailable() < newQuantity) {
                throw new AppException(ErrorCode.OUT_OF_STOCK);
            }

            existingDetail.setQuantity(newQuantity);
            cartDetailRepository.save(existingDetail);
        } else {
            // Trường hợp CHƯA CÓ -> Tạo mới CartDetail
            CartDetail newDetail = new CartDetail();
            newDetail.setCart(cart);
            newDetail.setProductVariant(variant);
            newDetail.setQuantity(request.getQuantity());
            cartDetailRepository.save(newDetail);
        }

        // 6. Cập nhật lại thời gian update của Giỏ hàng
        cart.setUpdatedAt(LocalDateTime.now());
        cartRepository.save(cart);
    }

    @Transactional
    public void updateCartItemQuantity(Long cartDetailId, UpdateCartItemRequest request) {
        // 1. Lấy User đang đăng nhập
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        // 2. Tìm Giỏ hàng của User (Nếu không có giỏ hàng thì báo lỗi 404)
        Cart cart = cartRepository.findByUser(user)
                .orElseThrow(() -> new AppException(ErrorCode.CART_NOT_FOUND));

        // 3. Tìm CartDetail (Bảo mật: Phải khớp ID VÀ phải nằm trong đúng Cart của User
        // này)
        CartDetail cartDetail = cartDetailRepository.findByCartDetailIdAndCart(cartDetailId, cart)
                .orElseThrow(() -> new AppException(ErrorCode.CART_DETAIL_NOT_FOUND));

        // 4. Kiểm tra tồn kho
        ProductVariant variant = cartDetail.getProductVariant();
        if (request.getQuantity() > variant.getTotalAvailable()) {
            throw new AppException(ErrorCode.OUT_OF_STOCK,
                    "Số lượng yêu cầu vượt quá tồn kho (Hiện còn: " + variant.getTotalAvailable() + ")");
        }

        // 5. Cập nhật số lượng mới (Ghi đè số lượng cũ)
        cartDetail.setQuantity(request.getQuantity());
        cartDetailRepository.save(cartDetail);

        // 6. Cập nhật lại thời gian sửa giỏ hàng
        cart.setUpdatedAt(LocalDateTime.now());
        cartRepository.save(cart);
    }

    @Transactional
    public void removeCartItem(Long cartDetailId) {
        // 1. Lấy User đang đăng nhập
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        // 2. Tìm Giỏ hàng của User
        Cart cart = cartRepository.findByUser(user)
                .orElseThrow(() -> new AppException(ErrorCode.CART_NOT_FOUND));

        // 3. Tìm CartDetail (Bảo mật: Phải khớp ID VÀ thuộc về đúng Giỏ hàng của User
        // này)
        CartDetail cartDetail = cartDetailRepository.findByCartDetailIdAndCart(cartDetailId, cart)
                .orElseThrow(() -> new AppException(ErrorCode.CART_DETAIL_NOT_FOUND));

        // 4. Thực hiện xóa cứng (Hard Delete) khỏi Database
        cartDetailRepository.delete(cartDetail);

        // 5. Cập nhật lại thời gian sửa giỏ hàng
        cart.setUpdatedAt(LocalDateTime.now());
        cartRepository.save(cart);
    }

    @Transactional
    public void clearCart() {
        // 1. Lấy User đang đăng nhập
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        // 2. Tìm Giỏ hàng của User
        Cart cart = cartRepository.findByUser(user)
                .orElseThrow(() -> new AppException(ErrorCode.CART_NOT_FOUND));

        // 3. Xóa sạch ruột (toàn bộ CartDetail)
        cartDetailRepository.deleteAllByCart(cart);

        // 4. Cập nhật lại thời gian của cái "vỏ" Giỏ hàng
        cart.setUpdatedAt(LocalDateTime.now());
        cartRepository.save(cart);
    }
}