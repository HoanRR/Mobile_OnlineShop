package com.PBL3.Mobile_OnlineShop.Service;

import com.PBL3.Mobile_OnlineShop.Config.SecurityConfig;
import com.PBL3.Mobile_OnlineShop.Exeption.AppException;
import com.PBL3.Mobile_OnlineShop.Exeption.ErrorCode;
import com.PBL3.Mobile_OnlineShop.Repository.OrderRepository;
import com.PBL3.Mobile_OnlineShop.Repository.UserRepository;
import com.PBL3.Mobile_OnlineShop.dto.request.CreateAccountRequest;
import com.PBL3.Mobile_OnlineShop.dto.request.UpdateUserRequest;
import com.PBL3.Mobile_OnlineShop.dto.response.*;
import com.PBL3.Mobile_OnlineShop.entity.Order;
import com.PBL3.Mobile_OnlineShop.entity.User;
import com.PBL3.Mobile_OnlineShop.enums.Role;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level =  AccessLevel.PRIVATE, makeFinal = true)
public class UserService {
    UserRepository userRepository;
    PasswordEncoder passwordEncoder;

    @Transactional(readOnly = true)
    public UserDetailResponse getUser(Long id){
        User user = userRepository.findByUserId(id).orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND, "Không tìm thấy user có ID: "+ id));
        UserDetailResponse response = UserDetailResponse
                .builder()
                .user_id(user.getUserId())
                .email(user.getEmail())
                .phone_number(user.getPhoneNumber())
                .role(user.getRole())
                .username(user.getUsername())
                .build();
        List<OrderHistoryResponse> orderHistoryResponse = new ArrayList<>();
        for (Order order: user.getOrders()){
            OrderHistoryResponse OHReponse = OrderHistoryResponse.builder()
                    .order_id(order.getOrderId())
                    .order_date(order.getOrderDate())
                    .total_amount(order.getTotalAmount())
                    .discount_amount(order.getDiscountAmount())
                    .payment_method(order.getPaymentMethod())
                    .is_paid(order.getIsPaid())
                    .order_status(order.getOrderStatus() != null ? order.getOrderStatus().toString() : null)
                    .build();
            orderHistoryResponse.add(OHReponse);
        }
        response.setOrder_history(orderHistoryResponse);
        return  response;
    }

    public PaginatedResponse<UserResponse> getUsers(String roleStr, String search, String sortBy, int page, int limit) {
        int pageNo = page > 0 ? page - 1 : 0;
        Sort sort = Sort.by(Sort.Direction.ASC, "userId");
        if ("username".equalsIgnoreCase(sortBy))
            sort = Sort.by(Sort.Direction.ASC, "username");
        else if ("email".equalsIgnoreCase(sortBy))
            sort = Sort.by(Sort.Direction.ASC, "email");

        Pageable pageable = PageRequest.of(pageNo, limit, sort);
        Role role = null;
        if (roleStr != null && !roleStr.isEmpty()) {
            try {
                role = Role.valueOf(roleStr.toUpperCase());
            } catch (IllegalArgumentException e) {
                throw new AppException(ErrorCode.VALIDATION_ERROR,
                        "Role không hợp lệ (Chỉ nhận CUSTOMER, EMPLOYEE, ADMIN)");
            }
        }

        Page<User> userPage = userRepository.findUsersWithFilters(role, search, pageable);

        List<UserResponse> data = userPage.getContent().stream()
                .map(u -> UserResponse.builder()
                        .user_Id(u.getUserId())
                        .username(u.getUsername())
                        .email(u.getEmail())
                        .phone_number(u.getPhoneNumber())
                        .role(u.getRole().name())
                        .build())
                .collect(Collectors.toList());

        PaginatedResponse.PaginationMeta meta = new PaginatedResponse.PaginationMeta(page, limit,
                userPage.getTotalElements());

        return new PaginatedResponse<>(data, meta);
    }

    @Transactional
    public MessageResponse createAccount(CreateAccountRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new AppException(ErrorCode.USERNAME_EXISTS);
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new AppException(ErrorCode.EMAIL_EXISTS);
        }
        if (userRepository.existsByPhoneNumber(request.getPhone_number())) {
            throw new AppException(ErrorCode.PHONE_EXISTS);
        }

        String rawPassword = request.getPassword();
        boolean isAutoGenerated = false;

        if (rawPassword == null || rawPassword.trim().isEmpty()) {
            rawPassword = generateRandomPassword(8);
            isAutoGenerated = true;
        }

        User acc = User.builder()
                .username(request.getUsername())
                .email(request.getEmail())
                .FullName(request.getFull_name())
                .phoneNumber(request.getPhone_number())
                .password(passwordEncoder.encode(rawPassword))
                .build();

        try {
            Role role = Role.valueOf(request.getRole().toUpperCase());
            acc.setRole(role);
        } catch (IllegalArgumentException e) {
            throw new AppException(ErrorCode.VALIDATION_ERROR,
                    "Role không hợp lệ (Chỉ nhận CUSTOMER, EMPLOYEE, ADMIN)");
        }

        userRepository.save(acc);

        if (isAutoGenerated) {
            return MessageResponse.builder().message("Tạo tài khoản thành công! Mật khẩu tự động là: " + rawPassword).build();
        }
        return MessageResponse.builder().message("Tạo tài khoản thành công!").build();
    }

    private String generateRandomPassword(int length) {
        String chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%!";
        SecureRandom random = new SecureRandom();
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < length; i++) {
            sb.append(chars.charAt(random.nextInt(chars.length())));
        }
        return sb.toString();
    }

    @Transactional
    public void updateUser(Long userId, UpdateUserRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        if (request.getPhoneNumber() != null) {
            if (!user.getPhoneNumber().equals(request.getPhoneNumber())
                    && userRepository.existsByPhoneNumber(request.getPhoneNumber())) {
                throw new AppException(ErrorCode.PHONE_EXISTS);
            }
            user.setPhoneNumber(request.getPhoneNumber());
        }
        if (request.getFullName() != null) {
            user.setFullName(request.getFullName());
        }

        if (request.getEmail() != null) {
            if (!user.getEmail().equals(request.getEmail())
                    && userRepository.existsByEmail(request.getEmail())) {
                throw new AppException(ErrorCode.EMAIL_EXISTS);
            }
            user.setEmail(request.getEmail());
        }

        if (request.getRole() != null) {
            try {
                Role role = Role.valueOf(request.getRole().toUpperCase());
                user.setRole(role);
            } catch (IllegalArgumentException e) {
                throw new AppException(ErrorCode.VALIDATION_ERROR,
                        "Role không hợp lệ (Chỉ nhận CUSTOMER, EMPLOYEE, ADMIN)");
            }
        }

        if (request.getPassword() != null && !request.getPassword().trim().isEmpty()) {
            user.setPassword(passwordEncoder.encode(request.getPassword()));
        }
    }

}
