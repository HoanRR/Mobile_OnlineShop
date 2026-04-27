package com.PBL3.Mobile_OnlineShop.controller;

import com.PBL3.Mobile_OnlineShop.Service.ProductService;
import com.PBL3.Mobile_OnlineShop.dto.response.PaginatedResponse;
import com.PBL3.Mobile_OnlineShop.dto.response.ProductDetailResponse;
import com.PBL3.Mobile_OnlineShop.dto.response.ProductViewResponse;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PostAuthorize;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Repository;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ProductController {
    ProductService productService;
    @GetMapping()
    public ResponseEntity<PaginatedResponse<ProductViewResponse>> GetProductView(
            @RequestParam(defaultValue = "1")            int    page,
            @RequestParam(defaultValue = "10")           int    limit,
            @RequestParam(required = false)              String brand,
            @RequestParam(required = false)              String keyword,
            @RequestParam(defaultValue = "price")        String sortBy,
            @RequestParam(defaultValue = "asc")          String order
    ){
        return ResponseEntity.ok(
                productService.GetProductView(page, limit, brand, keyword, sortBy, order)
        );
    }

    @GetMapping("/{product_id}")
    public ResponseEntity<ProductDetailResponse> GetProductDetail(@PathVariable Long product_id){
        return ResponseEntity.ok(productService.GetProductDetail(product_id));
    }
}
