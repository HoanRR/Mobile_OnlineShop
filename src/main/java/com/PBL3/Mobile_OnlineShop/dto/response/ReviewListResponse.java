package com.PBL3.Mobile_OnlineShop.dto.response;

import java.util.List;
import java.util.Map;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ReviewListResponse {
    Double avg_rating;
    Long total_reviews;
    Map<String, Long> distribution;
    List<ReviewResponse> reviews;
    PaginatedResponse.PaginationMeta pagination;
}
