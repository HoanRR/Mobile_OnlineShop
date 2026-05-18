package com.PBL3.Mobile_OnlineShop.dto.response;

import com.PBL3.Mobile_OnlineShop.enums.Role;
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@JsonInclude(JsonInclude.Include.NON_NULL)
public class MyInfoResponse {
    Long user_id;
    String username;
    String full_name;
    String email;
    String phone_number;
    Role role;
}