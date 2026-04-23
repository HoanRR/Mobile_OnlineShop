package com.PBL3.Mobile_OnlineShop.service.impl;

import com.PBL3.Mobile_OnlineShop.config.CustomJwtDecoder;
import com.PBL3.Mobile_OnlineShop.config.JwtTokenProvider;
import com.PBL3.Mobile_OnlineShop.dto.request.LoginRequest;
import com.PBL3.Mobile_OnlineShop.dto.request.RefreshTokenRequest;
import com.PBL3.Mobile_OnlineShop.dto.request.StaffCreateRequest;
import com.PBL3.Mobile_OnlineShop.dto.request.UserRegisterRequest;
import com.PBL3.Mobile_OnlineShop.dto.request.UserUpdateRequest;
import com.PBL3.Mobile_OnlineShop.dto.response.LoginResponse;
import com.PBL3.Mobile_OnlineShop.dto.response.PaginatedResponse;
import com.PBL3.Mobile_OnlineShop.dto.response.RefreshTokenResponse;
import com.PBL3.Mobile_OnlineShop.dto.response.UserDetailResponse;
import com.PBL3.Mobile_OnlineShop.dto.response.UserResponse;
import com.PBL3.Mobile_OnlineShop.entity.Cart;
import com.PBL3.Mobile_OnlineShop.entity.InvalidatedToken;
import com.PBL3.Mobile_OnlineShop.entity.User;
import com.PBL3.Mobile_OnlineShop.repository.InvalidatedTokenRepository;
import com.PBL3.Mobile_OnlineShop.repository.UserRepository;
import com.PBL3.Mobile_OnlineShop.service.UserService;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.PBL3.Mobile_OnlineShop.enums.Role;
import com.PBL3.Mobile_OnlineShop.exception.AppException;
import com.PBL3.Mobile_OnlineShop.exception.ErrorCode;

import org.springframework.data.domain.PageRequest;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jwt.Jwt;

import java.time.LocalDateTime;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import java.util.List;
import java.util.Collections;
import java.security.SecureRandom;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final InvalidatedTokenRepository invalidatedTokenRepository;

    private final JwtTokenProvider jwtTokenProvider;
    private final CustomJwtDecoder customJwtDecoder;

    @Override
    @Transactional
    public void register(UserRegisterRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new AppException(ErrorCode.USERNAME_EXISTS);
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new AppException(ErrorCode.EMAIL_EXISTS);
        }
        if (userRepository.existsByPhoneNumber(request.getPhoneNumber())) {
            throw new AppException(ErrorCode.PHONE_EXISTS);
        }

        User newUser = new User();
        newUser.setFullName(request.getFullName());
        newUser.setUsername(request.getUsername());
        newUser.setEmail(request.getEmail());
        newUser.setPhoneNumber(request.getPhoneNumber());
        newUser.setPassword(passwordEncoder.encode(request.getPassword()));
        newUser.setRole(Role.CUSTOMER);

        Cart newCart = new Cart();
        newCart.setUser(newUser);
        newCart.setUpdatedAt(LocalDateTime.now());
        newUser.setCart(newCart);

        userRepository.save(newUser);
    }

    @Override
    public LoginResponse login(LoginRequest request) {
        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new AppException(ErrorCode.INVALID_CREDENTIALS));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new AppException(ErrorCode.INVALID_CREDENTIALS);
        }

        // TẠO TOKEN BẰNG NIMBUS
        String accessToken = jwtTokenProvider.generateToken(user);
        String refreshToken = jwtTokenProvider.generateRefreshToken(user);

        LoginResponse.UserInfoDto userInfo = new LoginResponse.UserInfoDto();
        userInfo.setUserId(user.getUserId());
        userInfo.setUsername(user.getUsername());
        userInfo.setRole(user.getRole().name());

        LoginResponse response = new LoginResponse();
        response.setAccessToken(accessToken);
        response.setRefreshToken(refreshToken);
        response.setUser(userInfo);

        return response;
    }

    @Override
    public void logout(String token) {
        InvalidatedToken invalidatedToken = new InvalidatedToken();
        // Sinh ra 1 cái ID ngẫu nhiên làm Khóa chính
        invalidatedToken.setId(java.util.UUID.randomUUID().toString());
        invalidatedToken.setToken(token);

        invalidatedTokenRepository.save(invalidatedToken);
    }

    @Override
    public RefreshTokenResponse refreshAccessToken(RefreshTokenRequest request) {
        try {
            // 1. Dùng Nimbus để giải mã (Nó sẽ tự động kiểm tra chữ ký và hạn sử dụng)
            Jwt jwt = customJwtDecoder.decode(request.getRefreshToken());

            // 2. Lấy định danh User từ bụng Token (Ở file JwtTokenProvider mình để email)
            String email = jwt.getSubject();

            // 3. Tìm User (Lưu ý: Nếu Repository của bạn chưa có hàm findByEmail thì báo
            // mình nhé)
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

            // 4. Sinh ra Access Token mới
            String newAccessToken = jwtTokenProvider.generateToken(user);

            return new RefreshTokenResponse(newAccessToken);

        } catch (Exception e) {
            // Nếu decode lỗi (hết hạn, sai chữ ký, nằm trong Sổ đen...) -> Quăng lỗi bắt
            // đăng nhập lại
            throw new AppException(ErrorCode.INVALID_REFRESH_TOKEN);
        }
    }

    @Override
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
            } catch (Exception e) {
                // Ignore để null nếu lỗi parse role
            }
        }

        Page<User> userPage = userRepository.findUsersWithFilters(role, search, pageable);

        List<UserResponse> data = userPage.getContent().stream()
                .map(u -> UserResponse.builder()
                        .userId(u.getUserId())
                        .username(u.getUsername())
                        .email(u.getEmail())
                        .phoneNumber(u.getPhoneNumber())
                        .role(u.getRole().name())
                        .build())
                .collect(Collectors.toList());

        PaginatedResponse.PaginationMeta meta = new PaginatedResponse.PaginationMeta(page, limit,
                userPage.getTotalElements());

        return new PaginatedResponse<>(data, meta);
    }

    @Override
    @Transactional(readOnly = true)
    public UserDetailResponse getUserDetail(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        List<UserDetailResponse.OrderHistoryDto> orderHistory = (user.getOrders() == null)
                ? Collections.emptyList()
                : user.getOrders().stream()
                        .map(order -> UserDetailResponse.OrderHistoryDto.builder()
                                .orderId(order.getOrderId())
                                .orderStatus(order.getOrderStatus().name())
                                .totalAmount(order.getTotalAmount())
                                .orderDate(order.getOrderDate())
                                .build())
                        .collect(Collectors.toList());

        return UserDetailResponse.builder()
                .userId(user.getUserId())
                .username(user.getUsername())
                .email(user.getEmail())
                .phoneNumber(user.getPhoneNumber())
                .role(user.getRole().name())
                .orderHistory(orderHistory)
                .build();
    }

    @Override
    public String createStaff(StaffCreateRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new AppException(ErrorCode.USERNAME_EXISTS);
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new AppException(ErrorCode.EMAIL_EXISTS);
        }
        if (userRepository.existsByPhoneNumber(request.getPhoneNumber())) {
            throw new AppException(ErrorCode.PHONE_EXISTS);
        }

        String rawPassword = request.getPassword();
        boolean isAutoGenerated = false;

        if (rawPassword == null || rawPassword.trim().isEmpty()) {
            rawPassword = generateRandomPassword(8);
            isAutoGenerated = true;
        }

        User staff = new User();
        staff.setUsername(request.getUsername());
        staff.setFullName(request.getFullName());
        staff.setEmail(request.getEmail());
        staff.setPhoneNumber(request.getPhoneNumber());
        staff.setPassword(passwordEncoder.encode(rawPassword));

        try {
            Role role = Role.valueOf(request.getRole().toUpperCase());
            staff.setRole(role);
        } catch (IllegalArgumentException e) {
            throw new AppException(ErrorCode.VALIDATION_ERROR,
                    "Role không hợp lệ (Chỉ nhận CUSTOMER, EMPLOYEE, ADMIN)");
        }

        userRepository.save(staff);

        if (isAutoGenerated) {
            return "Tạo tài khoản thành công! Mật khẩu tự động là: " + rawPassword;
        }
        return "Tạo tài khoản thành công!";
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

    @Override
    @Transactional
    public void updateUser(Long userId, UserUpdateRequest request) {
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