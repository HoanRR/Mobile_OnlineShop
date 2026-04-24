package com.PBL3.Mobile_OnlineShop.dto.response;

import com.PBL3.Mobile_OnlineShop.enums.Role;
import jakarta.validation.constraints.Email;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class GetUserResponse {
    Long user_id;
    String username;
    String email;
    String phone_number;
    Role role;
    List<OrderHistoryResponse> order_history;
}
