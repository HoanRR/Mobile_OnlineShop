package com.PBL3.Mobile_OnlineShop.dto.response;

import com.PBL3.Mobile_OnlineShop.enums.Role;
import lombok.*;
import lombok.experimental.FieldDefaults;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UserDetailResponse {
    Long user_id;
    String username;
    String email;
    String phone_number;
    Role role;
    
    @JsonProperty("full_name")
    String fullName;
    
    List<OrderHistoryResponse> order_history;
}
