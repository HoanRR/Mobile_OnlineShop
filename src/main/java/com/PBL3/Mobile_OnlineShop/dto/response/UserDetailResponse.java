package com.PBL3.Mobile_OnlineShop.dto.response;

import com.PBL3.Mobile_OnlineShop.enums.Role;
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@JsonInclude(JsonInclude.Include.NON_NULL)
public class UserDetailResponse {
    Long user_id;
    String username;
    String email;
    String phone_number;
    String full_name;
    Role role;
    List<OrderHistoryResponse> order_history;
}
