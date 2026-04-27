package com.PBL3.Mobile_OnlineShop.dto.response;


import com.PBL3.Mobile_OnlineShop.enums.Role;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class MyInfoResponse {
    Long userId;
    String username;
    String name;
    String email;
    String phoneNumber;
    Role roles;
}