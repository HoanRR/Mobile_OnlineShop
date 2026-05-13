package com.PBL3.Mobile_OnlineShop.enums;

public enum DeviceStatus {
    AVAILABLE, // Sẵn sàng bán
    PENDING, // Khách đã đặt (đang chờ xử lý/thanh toán)
    SOLD, // Đã bán thành công
    WARRANTY, // Đang trong chế độ bảo hành/sửa chữa
    DEFECTIVE, // Hàng lỗi (đang đợi xử lý hoặc trả về NSX)
    RETURNED // Khách trả lại (chờ kiểm định để chuyển về AVAILABLE hoặc DEFECTIVE)
}