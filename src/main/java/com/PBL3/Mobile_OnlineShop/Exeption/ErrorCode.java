package com.PBL3.Mobile_OnlineShop.Exeption;

import lombok.AllArgsConstructor;
import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
@AllArgsConstructor
public enum ErrorCode {


    USERNAME_EXISTS("USERNAME_EXISTS", "Username đã tồn tại", HttpStatus.CONFLICT),
    EMAIL_EXISTS("EMAIL_EXISTS", "Email đã tồn tại", HttpStatus.CONFLICT),
    PHONE_EXISTS("PHONE_EXISTS", "Số điện thoại đã tồn tại", HttpStatus.CONFLICT),
    IMEI_EXISTS("IMEI_EXISTS", "IMEI đã tồn tại trong hệ thống", HttpStatus.CONFLICT),
    INVALID_CREDENTIALS("INVALID_CREDENTIALS", "Sai username hoặc mật khẩu", HttpStatus.UNAUTHORIZED),
    INVALID_REFRESH_TOKEN("INVALID_REFRESH_TOKEN", "Refresh token hết hạn hoặc không hợp lệ", HttpStatus.UNAUTHORIZED),
    USER_NOT_FOUND("USER_NOT_FOUND", "Người dùng không tồn tại", HttpStatus.NOT_FOUND),
    PRODUCT_NOT_FOUND("PRODUCT_NOT_FOUND", "Sản phẩm không tồn tại", HttpStatus.NOT_FOUND),
    DEVICES_NOT_FOUND("DEVICES_NOT_FOUND", "Thiết bị không tồn tại", HttpStatus.NOT_FOUND),
    WARRANTY_NOT_FOUND("WARRNATY_NOT_FOUND", "Thiết bị không tồn tại", HttpStatus.NOT_FOUND),
    UNAUTHORIZED("UNAUTHORIZED", "Bạn chưa đăng nhập", HttpStatus.UNAUTHORIZED),
    FORBIDDEN("FORBIDDEN", "Bạn không có quyền truy cập", HttpStatus.FORBIDDEN),
    VALIDATION_ERROR("VALIDATION_ERROR", "Dữ liệu không hợp lệ", HttpStatus.BAD_REQUEST),
    INTERNAL_ERROR("INTERNAL_ERROR", "Lỗi hệ thống", HttpStatus.INTERNAL_SERVER_ERROR),
    UNAUTHENTICATED("UNAUTHENTICATED_ERROR", "Lỗi chưa xác thực", HttpStatus.FORBIDDEN),
    INVALID_DATA("INVALID_DATA", "Dữ liệu không hợp lệ", HttpStatus.UNPROCESSABLE_ENTITY);

    private final String code;
    private final String message;
    private final HttpStatus httpStatus;
}
