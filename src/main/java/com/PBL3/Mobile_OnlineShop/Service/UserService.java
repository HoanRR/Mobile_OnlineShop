package com.PBL3.Mobile_OnlineShop.Service;

import com.PBL3.Mobile_OnlineShop.Exeption.AppException;
import com.PBL3.Mobile_OnlineShop.Exeption.ErrorCode;
import com.PBL3.Mobile_OnlineShop.Repository.OrderRepository;
import com.PBL3.Mobile_OnlineShop.Repository.UserRepository;
import com.PBL3.Mobile_OnlineShop.dto.response.GetDevicesResponse;
import com.PBL3.Mobile_OnlineShop.dto.response.GetUserResponse;
import com.PBL3.Mobile_OnlineShop.dto.response.OrderHistoryResponse;
import com.PBL3.Mobile_OnlineShop.entity.Order;
import com.PBL3.Mobile_OnlineShop.entity.User;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level =  AccessLevel.PRIVATE, makeFinal = true)
public class UserService {
    UserRepository userRepository;
    OrderRepository orderRepository;
    public GetUserResponse getUser(Long id){
        User user = userRepository.findByUserId(id).orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND, "Không tìm thấy user có ID: "+ id));
        GetUserResponse response = GetUserResponse
                .builder()
                .user_id(user.getUserId())
                .email(user.getEmail())
                .phone_number(user.getPhoneNumber())
                .role(user.getRoles())
                .username(user.getUsername())
                .build();
        List<OrderHistoryResponse> orderHistoryResponse = List.of();
        for (Order order: user.getOrders()){
            OrderHistoryResponse OHReponse = OrderHistoryResponse.builder()
                    .order_id(order.getOrderId())
                    .order_date(order.getOrderDate())
                    .total_amount(order.getTotalAmount())
                    .order_status(order.getOrderStatus().toString())
                    .build();
            orderHistoryResponse.add(OHReponse);
        }
        response.setOrder_history(orderHistoryResponse);
        return  response;
    }
}
