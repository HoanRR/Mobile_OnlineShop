package com.PBL3.Mobile_OnlineShop.dto.reponse;

import lombok.Data;

@Data
public class UserResponse {
    private Long userId;
    private String username;
    private String email;
    private String phoneNumber;
    private String role;
}