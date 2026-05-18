package com.PBL3.Mobile_OnlineShop.controller.staff;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.PBL3.Mobile_OnlineShop.Service.ReviewService;
import com.PBL3.Mobile_OnlineShop.dto.response.ReviewResponse;

import lombok.RequiredArgsConstructor;
import lombok.Data;

@RestController
@RequestMapping("/api/staff/reviews")
@RequiredArgsConstructor
public class StaffReviewController {

    private final ReviewService reviewService;

    @PostMapping("/{review_id}/reply")
    @PreAuthorize("hasAuthority('EMPLOYEE')")
    public ResponseEntity<ReviewResponse> replyToReview(
            @PathVariable("review_id") Long reviewId,
            @RequestBody ReplyRequest request) {
        
        return ResponseEntity.ok(reviewService.replyToReview(reviewId, request.getReply()));
    }
    
    @Data
    public static class ReplyRequest {
        private String reply;
    }
}
