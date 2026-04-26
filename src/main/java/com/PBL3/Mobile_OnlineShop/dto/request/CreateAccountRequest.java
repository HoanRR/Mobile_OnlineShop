package com.PBL3.Mobile_OnlineShop.dto.request;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CreateAccountRequest  {
    @NotNull(message = "Tên đăng nhập không được để trống")
    String username;

    @NotNull(message = "Họ và tên không được để trống")
    String full_name;

    @Email(message = "Email không đúng định dạng")
    String email;

    @NotNull(message = "Số điện thoại không được để trống")
    @Pattern(regexp = "^(0|\\+84)[0-9]{9}$", message = "Số điện thoại không hợp lệ")
    String phone_number;

    @NotNull(message = "Mật khẩu không được để trống")
    @Size(min = 6, message = "Mật khẩu phải từ 6 ký tự")
    String password;

    @NotNull(message = "Phân quyền không được để trống")
    String role;
}
