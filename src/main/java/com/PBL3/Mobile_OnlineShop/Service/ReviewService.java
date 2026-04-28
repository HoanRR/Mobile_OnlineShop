package com.PBL3.Mobile_OnlineShop.Service;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.hibernate.event.spi.LockEventListener;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import com.PBL3.Mobile_OnlineShop.Exeption.AppException;
import com.PBL3.Mobile_OnlineShop.Exeption.ErrorCode;
import com.PBL3.Mobile_OnlineShop.Repository.OrderDetailRepository;
import com.PBL3.Mobile_OnlineShop.Repository.ProductRepository;
import com.PBL3.Mobile_OnlineShop.Repository.ProductReviewRepository;
import com.PBL3.Mobile_OnlineShop.Repository.ProductVariantRepository;
import com.PBL3.Mobile_OnlineShop.Repository.UserRepository;
import com.PBL3.Mobile_OnlineShop.dto.request.ProductReviewRequest;
import com.PBL3.Mobile_OnlineShop.dto.response.PaginatedResponse;
import com.PBL3.Mobile_OnlineShop.dto.response.ReviewListResponse;
import com.PBL3.Mobile_OnlineShop.dto.response.ReviewResponse;
import com.PBL3.Mobile_OnlineShop.entity.OrderDetail;
import com.PBL3.Mobile_OnlineShop.entity.Product;
import com.PBL3.Mobile_OnlineShop.entity.ProductReview;
import com.PBL3.Mobile_OnlineShop.entity.ProductVariant;
import com.PBL3.Mobile_OnlineShop.entity.User;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ReviewService {
    ProductRepository productRepository;
    UserRepository userRepository;
    ProductVariantRepository productVariantRepository;
    ProductReviewRepository productReviewRepository;
    OrderDetailRepository orderDetailRepository;

    public ReviewResponse createReview(ProductReviewRequest request) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated()) {
            throw new AppException(ErrorCode.UNAUTHENTICATED);
        }
        String username = authentication.getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        // Get product tu product variant ID
        ProductVariant productVariant = productVariantRepository.findById(request.getProductVariantId())
                .orElseThrow(() -> new AppException(ErrorCode.PRODUCT_NOT_FOUND));
        Product product = productVariant.getProduct();

        boolean hasPurchased = orderDetailRepository
                .existsByOrder_OrderIdAndOrder_User_UserIdAndProductVariant_Product_ProductId(request.getOrderId(),
                        user.getUserId(), product.getProductId());
        if (!hasPurchased) {
            throw new AppException(ErrorCode.PRODUCT_NOT_PURCHASED,
                    "Bạn chưa mua sản phẩm này trong đơn hàng " + request.getOrderId());
        }

        boolean hasReviewed = productReviewRepository.existsByUser_UserIdAndProduct_ProductId(user.getUserId(),
                product.getProductId());
        if (hasReviewed) {
            throw new AppException(ErrorCode.REVIEW_ALREADY_EXISTED);
        }

        ProductReview productReview = ProductReview.builder()
                .product(product)
                .productVariant(productVariant)
                .user(user)
                .rating(request.getRating())
                .comment(request.getComment())
                .reviewDate(LocalDateTime.now())
                .isPurchased(true)
                .build();

        ReviewResponse.variantInfo variantinfo = ReviewResponse.variantInfo.builder()
                .product_variant_id(productVariant.getProductVariantId())
                .color(productVariant.getColor())
                .storage_capacity(productVariant.getStorageCapacity())
                .build();

        productReviewRepository.save(productReview);
        return ReviewResponse.builder()
                .product_review_id(productReview.getProductReviewId())
                .product_id(product.getProductId())
                .user_id(user.getUserId())
                .rating(productReview.getRating())
                .comment(productReview.getComment())
                .review_date(productReview.getReviewDate().toString())
                .is_purchased(true)
                .variant(variantinfo)
                .build();
    }

    public ReviewListResponse getProductReviews(Long productId, Long variantId, Integer rating, int page, int limit) {
        int pageNo = page > 0 ? page - 1 : 0;
        Pageable pageable = PageRequest.of(pageNo, limit, Sort.by(Sort.Direction.DESC, "reviewDate"));

        Page<ProductReview> reviewPage = productReviewRepository.findReviewsWithFilters(productId, variantId, rating,
                pageable);

        List<ReviewResponse> reviewList = reviewPage.getContent().stream().map(review -> ReviewResponse.builder()
                .product_review_id(review.getProductReviewId())
                .user_id(review.getUser().getUserId())
                .username(review.getUser().getUsername())
                .rating(review.getRating())
                .comment(review.getComment())
                .review_date(review.getReviewDate() != null ? review.getReviewDate().toString() : null)
                .is_purchased(review.getIsPurchased())
                .variant(review.getProductVariant() != null ? ReviewResponse.variantInfo.builder()
                        .product_variant_id(review.getProductVariant().getProductVariantId())
                        .color(review.getProductVariant().getColor())
                        .storage_capacity(review.getProductVariant().getStorageCapacity())
                        .build() : null)
                .build()).collect(Collectors.toList());

        Map<String, Long> distribution = new LinkedHashMap<>();
        for (int i = 5; i >= 1; i--)
            distribution.put(String.valueOf(i), 0L);

        List<Object[]> rawStats = productReviewRepository.countRatingDistribution(productId);
        long totalReviews = 0;
        double totalScore = 0;

        for (Object[] row : rawStats) {
            Integer star = (Integer) row[0];
            Long count = (Long) row[1];

            distribution.put(String.valueOf(star), count); 
            totalReviews += count;
            totalScore += (star * count);
        }

        // Tính điểm trung bình (Làm tròn 1 chữ số thập phân
        Double avgRating = totalReviews > 0 ? Math.round((totalScore / totalReviews) * 10.0) / 10.0 : 0.0;

        PaginatedResponse.PaginationMeta meta = new PaginatedResponse.PaginationMeta(page, limit,
                reviewPage.getTotalElements());

        return ReviewListResponse.builder()
                .avg_rating(avgRating)
                .total_reviews(totalReviews)
                .distribution(distribution)
                .reviews(reviewList)
                .pagination(meta)
                .build();
    }
}
