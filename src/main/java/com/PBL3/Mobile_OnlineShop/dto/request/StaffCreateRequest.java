package com.PBL3.Mobile_OnlineShop.dto.request;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class StaffCreateRequest {
    @NotBlank(message = "Username không được để trống")
    private String username;

    @NotBlank(message = "Tên không được để trống")
    @JsonProperty("full_name")
    private String fullName;

    @NotBlank(message = "Email không được để trống")
    @Email(message = "Email không hợp lệ")
    private String email;

    @NotBlank(message = "Số điện thoại không được để trống")
    @Pattern(regexp = "^(0|\\+84)[0-9]{9}$", message = "Số điện thoại không hợp lệ")
    @JsonProperty("phone_number")
    private String phoneNumber;

    // Chú ý: KHÔNG dùng @NotBlank ở đây vì Admin có thể bỏ trống để tự động tạo
    private String password;

    @NotBlank(message = "Role không được để trống")
    private String role;
}