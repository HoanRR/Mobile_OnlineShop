package com.PBL3.Mobile_OnlineShop.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.PBL3.Mobile_OnlineShop.Service.ReviewService;
import com.PBL3.Mobile_OnlineShop.Service.UserService;
import com.PBL3.Mobile_OnlineShop.dto.request.ProductReviewRequest;
import com.PBL3.Mobile_OnlineShop.dto.response.ReviewListResponse;
import com.PBL3.Mobile_OnlineShop.dto.response.ReviewResponse;

import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;

//api/products/:id/reviews
@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class UserReviewController {

    ReviewService reviewService;

    @PostMapping("/{product_id}/reviews")
    public ReviewResponse postMethodName(@Valid @RequestBody ProductReviewRequest request) {
        return reviewService.createReview(request);
    }

    @GetMapping("/{product_id}/reviews")
    public ResponseEntity<ReviewListResponse> getProductReviews(
            @PathVariable("product_id") Long productId,
            @RequestParam(value = "product_variant_id", required = false) Long variantId,
            @RequestParam(value = "rating", required = false) Integer rating,
            @RequestParam(value = "page", defaultValue = "1") int page,
            @RequestParam(value = "limit", defaultValue = "20") int limit) {
        ReviewListResponse response = reviewService.getProductReviews(productId, variantId, rating, page, limit);
        return ResponseEntity.ok(response); 
    }

}
