package com.PBL3.Mobile_OnlineShop.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class UserResponse {
    @JsonProperty("user_id")
    private Long userId;

    private String username;
    private String email;

    @JsonProperty("phone_number")
    private String phoneNumber;

    private String role;
}