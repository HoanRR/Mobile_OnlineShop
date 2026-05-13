package com.PBL3.Mobile_OnlineShop.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.logging.Level;

import javax.management.relation.Role;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UserResponse {
    Long user_Id;
    String username;
    String email;
    String phone_number;
    String role;
}