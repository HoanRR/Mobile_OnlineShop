package com.PBL3.Mobile_OnlineShop.enums;

public enum OrderStatus {
    WAIT, PROCESSING, DELIVERED, CANCELLED;

    // Hàm kiểm tra luồng trạng thái hợp lệ
    public boolean isValidTransition(OrderStatus nextStatus) {
        // Đang chờ -> Có thể chuyển sang Đang xử lý hoặc Bị huỷ
        if (this == WAIT && (nextStatus == PROCESSING || nextStatus == CANCELLED)) {
            return true;
        }

        // Đang xử lý -> Có thể chuyển sang Đã giao hoặc Bị huỷ
        if (this == PROCESSING && (nextStatus == DELIVERED || nextStatus == CANCELLED)) {
            return true;
        }

        // DELIVERED và CANCELLED là trạng thái cuối, không được đổi sang trạng thái
        // khác nữa
        return false;
    }
}