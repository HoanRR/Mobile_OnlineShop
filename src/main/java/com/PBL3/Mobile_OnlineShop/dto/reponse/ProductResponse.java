package com.PBL3.Mobile_OnlineShop.dto.reponse;

import lombok.Data;
import java.util.List;

@Data
public class ProductResponse {
    private Long productId;
    private String productName;
    private String brand;
    private String productImageLink;
    // Kèm theo danh sách các phiên bản của điện thoại này
    private List<ProductVariantResponse> variants;
}
