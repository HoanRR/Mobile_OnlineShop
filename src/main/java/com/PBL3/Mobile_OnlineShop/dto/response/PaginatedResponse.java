package com.PBL3.Mobile_OnlineShop.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PaginatedResponse<T> {
    private List<T> data; // dùng template để phân trang trong cả sp và đơn hàng
    private PaginationMeta pagination;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PaginationMeta {
        private int page;
        private int limit;
        private long total;
    }
}
