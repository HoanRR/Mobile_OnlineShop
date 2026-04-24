package com.PBL3.Mobile_OnlineShop.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class LogoutRequest {

    @NotBlank(message = "Token không được để trống")
    private String token;
}
