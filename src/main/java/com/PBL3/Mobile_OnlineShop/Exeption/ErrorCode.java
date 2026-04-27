package com.PBL3.Mobile_OnlineShop.Exeption;

import lombok.AllArgsConstructor;
import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
@AllArgsConstructor
public enum ErrorCode {

    // Thêm vào trong enum ErrorCode hiện tại của bạn
    WARRANTY_NOT_ACTIVATED("WARRANTY_NOT_ACTIVATED", "Thiết bị chưa được kích hoạt bảo hành", HttpStatus.BAD_REQUEST), // 400
    WARRANTY_EXPIRED("WARRANTY_EXPIRED", "Hết hạn bảo hành", HttpStatus.UNPROCESSABLE_ENTITY), // 422
    IMEI_NOT_FOUND("IMEI_NOT_FOUND", "IMEI không tồn tại", HttpStatus.NOT_FOUND), // 404
    IMEI_ALREADY_SOLD("IMEI_ALREADY_SOLD", "IMEI đã được bán hoặc không khả dụng", HttpStatus.CONFLICT), // 409
    ORDER_NOT_FOUND("ORDER_NOT_FOUND", "Đơn hàng không tồn tại", HttpStatus.NOT_FOUND),
    INVALID_STATUS_TRANSITION("INVALID_STATUS_TRANSITION", "Transition trạng thái không hợp lệ",
            HttpStatus.UNPROCESSABLE_ENTITY), // 422
    USERNAME_EXISTS("USERNAME_EXISTS", "Username đã tồn tại", HttpStatus.CONFLICT),
    EMAIL_EXISTS("EMAIL_EXISTS", "Email đã tồn tại", HttpStatus.CONFLICT),
    PHONE_EXISTS("PHONE_EXISTS", "Số điện thoại đã tồn tại", HttpStatus.CONFLICT),
    IMEI_EXISTS("IMEI_EXISTS", "IMEI đã tồn tại trong hệ thống", HttpStatus.CONFLICT),
    VOUCHER_EXISTS("VOUCHER_EXISTS", "VOUCHER đã tồn tại trong hệ thống", HttpStatus.CONFLICT),
    INVALID_CREDENTIALS("INVALID_CREDENTIALS", "Sai username hoặc mật khẩu", HttpStatus.UNAUTHORIZED),
    INVALID_REFRESH_TOKEN("INVALID_REFRESH_TOKEN", "Refresh token hết hạn hoặc không hợp lệ", HttpStatus.UNAUTHORIZED),
    USER_NOT_FOUND("USER_NOT_FOUND", "Người dùng không tồn tại", HttpStatus.NOT_FOUND),
    PRODUCT_NOT_FOUND("PRODUCT_NOT_FOUND", "Sản phẩm không tồn tại", HttpStatus.NOT_FOUND),
    DEVICES_NOT_FOUND("DEVICES_NOT_FOUND", "Thiết bị không tồn tại", HttpStatus.NOT_FOUND),
    WARRANTY_NOT_FOUND("WARRANTY_NOT_FOUND", "Thiết bị không tồn tại", HttpStatus.NOT_FOUND),
    CART_NOT_FOUND("CART_NOT_FOUND", "Thiết bị không tồn tại", HttpStatus.NOT_FOUND),
    CART_EMPTY("CART_EMPTY","Giỏ hàng rỗng", HttpStatus.BAD_REQUEST),
    VOUCHER_INVALID("VOUCHER_INVALID", "Voucher không hợp lệ", HttpStatus.UNPROCESSABLE_CONTENT),
    VOUCHER_EXPIRED("VOUCHER_EXPIRED", "Voucher đã hết hạn hoặc chưa bắt đầu", HttpStatus.UNPROCESSABLE_ENTITY),
    VOUCHER_INVALID_MIN_VALUE("VOUCHER_INVALID_MIN_VALUE", "Đơn hàng chưa đạt giá trị tối thiểu để áp dụng voucher", HttpStatus.UNPROCESSABLE_ENTITY),
    UNAUTHORIZED("UNAUTHORIZED", "Bạn chưa đăng nhập", HttpStatus.UNAUTHORIZED),
    FORBIDDEN("FORBIDDEN", "Bạn không có quyền truy cập", HttpStatus.FORBIDDEN),
    VALIDATION_ERROR("VALIDATION_ERROR", "Dữ liệu không hợp lệ", HttpStatus.BAD_REQUEST),
    INTERNAL_ERROR("INTERNAL_ERROR", "Lỗi hệ thống", HttpStatus.INTERNAL_SERVER_ERROR),
    UNAUTHENTICATED("UNAUTHENTICATED_ERROR", "Lỗi chưa xác thực", HttpStatus.FORBIDDEN),
    PRODUCT_HAS_ORDERS("PRODUCT_HAS_ORDERS", "Không thể xóa sản phẩm vì đã có đơn hàng liên quan", HttpStatus.CONFLICT),
    INVALID_DATA("INVALID_DATA", "Dữ liệu không hợp lệ", HttpStatus.UNPROCESSABLE_ENTITY),
    VOUCHER_NOT_FOUND("VOUCHER_NOT_FOUND", "Voucher không tồn tại", HttpStatus.NOT_FOUND),
    ;

    private final String code;
    private final String message;
    private final HttpStatus httpStatus;
}
