package com.PBL3.Mobile_OnlineShop.service.impl;

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
import com.PBL3.Mobile_OnlineShop.entity.User;
import com.PBL3.Mobile_OnlineShop.repository.UserRepository;
import com.PBL3.Mobile_OnlineShop.service.UserService;
import com.PBL3.Mobile_OnlineShop.util.JwtUtil;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.PBL3.Mobile_OnlineShop.enums.Role;

import org.springframework.data.domain.PageRequest;
import org.springframework.security.crypto.password.PasswordEncoder;
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
    private final JwtUtil jwtUtil;

    @Override
    @Transactional
    public void register(UserRegisterRequest request) {

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalStateException("The email already exists.");
        }
        if (userRepository.existsByPhoneNumber(request.getPhoneNumber())) {
            throw new IllegalStateException("The phone already exists.");
        }

        // 2. Chuyển đổi DTO -> Entity
        User newUser = new User();
        newUser.setFullName(request.getFullName());
        newUser.setUsername(request.getUsername());
        newUser.setEmail(request.getEmail());
        newUser.setPhoneNumber(request.getPhoneNumber());
        newUser.setPassword(passwordEncoder.encode(request.getPassword()));

        // 3. Logic bù đắp
        newUser.setRole(Role.CUSTOMER); // Đảm bảo quyền luôn là Customer

        Cart newCart = new Cart();
        newCart.setUser(newUser);
        newCart.setUpdatedAt(LocalDateTime.now());
        newUser.setCart(newCart);

        // 4. Lưu database (không cần return null nữa)
        userRepository.save(newUser);
    }

    @Override
    public LoginResponse login(LoginRequest request) {
        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new RuntimeException("Sai tên đăg nhập hoặc mật khẩu"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Sai tên đăng nhập hoặc mật khẩu");
        }

        // Tạo token thật từ JWT UTIL
        String accessToken = jwtUtil.generateAccessToken(user);
        String refreshToken = jwtUtil.generateRefreshToken(user);

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

    // abc
    @Override
    public RefreshTokenResponse refreshAccessToken(RefreshTokenRequest request) {
        String refreshToken = request.getRefreshToken();

        // 1. Kiểm tra Refresh Token xem có bị làm giả hoặc hết hạn chưa
        if (!jwtUtil.isTokenValid(refreshToken)) {
            throw new RuntimeException("Refresh Token không hợp lệ hoặc đã hết hạn. Vui lòng đăng nhập lại!");
        }

        // 2. Lấy username từ bụng Refresh Token
        String username = jwtUtil.extractUsername(refreshToken);

        // 3. Tìm User trong Database (để đảm bảo user này vẫn còn tồn tại, chưa bị xóa
        // hay khóa tài khoản)
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng."));

        // 4. Sinh ra Access Token mới
        String newAccessToken = jwtUtil.generateAccessToken(user);

        // 5. Trả về kết quả
        return new RefreshTokenResponse(newAccessToken);
    }
    // abc

    @Override
    public PaginatedResponse<UserResponse> getUsers(String roleStr, String search, String sortBy, int page, int limit) {

        // 1. Chuyển trang: UI thường truyền page 1,2,3 nhưng Spring Boot đếm từ 0,1,2
        int pageNo = page > 0 ? page - 1 : 0;

        // 2. Cấu hình Sắp xếp (Sorting)
        Sort sort = Sort.by(Sort.Direction.ASC, "userId"); // Mặc định sắp xếp theo ID
        if ("username".equalsIgnoreCase(sortBy))
            sort = Sort.by(Sort.Direction.ASC, "username");
        else if ("email".equalsIgnoreCase(sortBy))
            sort = Sort.by(Sort.Direction.ASC, "email");

        // 3. Khởi tạo đối tượng Pageable
        Pageable pageable = PageRequest.of(pageNo, limit, sort);

        // 4. Chuyển đổi tham số Role từ String sang Enum (Nếu có truyền lên)
        Role role = null;
        if (roleStr != null && !roleStr.isEmpty()) {
            try {
                role = Role.valueOf(roleStr.toUpperCase());
            } catch (Exception e) {
                /* Nếu truyền bậy bạ, bỏ qua lọc theo role */ }
        }

        // 5. Query xuống Database
        Page<User> userPage = userRepository.findUsersWithFilters(role, search, pageable);

        // 6. Map Entity -> DTO
        List<UserResponse> data = userPage.getContent().stream()
                .map(u -> UserResponse.builder()
                        .userId(u.getUserId())
                        .username(u.getUsername())
                        .email(u.getEmail())
                        .phoneNumber(u.getPhoneNumber())
                        .role(u.getRole().name())
                        .build())
                .collect(Collectors.toList());

        // 7. Gói kết quả vào PaginatedResponse
        PaginatedResponse.PaginationMeta meta = new PaginatedResponse.PaginationMeta(page, limit,
                userPage.getTotalElements());

        return new PaginatedResponse<>(data, meta);
    }

    @Override
    @Transactional(readOnly = true)
    public UserDetailResponse getUserDetail(Long userId) {

        // 1. Tìm user theo ID
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng với ID: " + userId));

        // 2. Chuyển đổi danh sách Order sang DTO
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

        // 3. Build kết quả trả về
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
        // 1. Kiểm tra trùng lặp (Bắn lỗi 409 Conflict)
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new IllegalStateException("Username đã tồn tại!");
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalStateException("Email đã tồn tại!");
        }
        if (userRepository.existsByPhoneNumber(request.getPhoneNumber())) {
            throw new IllegalStateException("Số điện thoại đã tồn tại!");
        }

        // 2. Xử lý Password (Nếu trống thì tự tạo)
        String rawPassword = request.getPassword();
        boolean isAutoGenerated = false;

        if (rawPassword == null || rawPassword.trim().isEmpty()) {
            rawPassword = generateRandomPassword(8); // Tự tạo pass 8 ký tự
            isAutoGenerated = true;
        }

        // 3. Map dữ liệu vào Entity
        User staff = new User();
        staff.setUsername(request.getUsername());
        staff.setFullName(request.getFullName());
        staff.setEmail(request.getEmail());
        staff.setPhoneNumber(request.getPhoneNumber());
        staff.setPassword(passwordEncoder.encode(rawPassword)); // Nhớ phải băm mật khẩu nhé!

        // Xử lý Role
        try {
            Role role = Role.valueOf(request.getRole().toUpperCase());
            staff.setRole(role);
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Role không hợp lệ (Chỉ nhận CUSTOMER, EMPLOYEE, ADMIN)");
        }

        // 4. Lưu xuống Database
        userRepository.save(staff);

        // 5. Trả về thông báo (Kèm mật khẩu nếu tự tạo)
        if (isAutoGenerated) {
            return "Tạo tài khoản thành công! Mật khẩu tự động là: " + rawPassword;
        }
        return "Tạo tài khoản thành công!";
    }

    // Hàm tiện ích hỗ trợ sinh mật khẩu ngẫu nhiên
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
    @Transactional // Mở giao dịch: Có lỗi là Rollback toàn bộ, thành công thì tự động Save
    public void updateUser(Long userId, UserUpdateRequest request) {

        // 1. Tìm User (Nếu không có thì ném lỗi để Controller bắt thành 404)
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User không tồn tại"));

        // 2. Cập nhật Số điện thoại (Chỉ update nếu có gửi lên)
        if (request.getPhoneNumber() != null) {
            // Check xem số mới có bị trùng với người khác trong DB không
            if (!user.getPhoneNumber().equals(request.getPhoneNumber())
                    && userRepository.existsByPhoneNumber(request.getPhoneNumber())) {
                throw new IllegalStateException("Số điện thoại đã tồn tại!");
            }
            user.setPhoneNumber(request.getPhoneNumber());
        }
        // cập nhật full name
        if (request.getFullName() != null) {
            // Không cần validate trùng lặp vì tên người thì được phép trùng nhau thoải mái
            user.setFullName(request.getFullName());
        }

        // 3. Cập nhật Email
        if (request.getEmail() != null) {
            if (!user.getEmail().equals(request.getEmail())
                    && userRepository.existsByEmail(request.getEmail())) {
                throw new IllegalStateException("Email đã tồn tại!");
            }
            user.setEmail(request.getEmail());
        }

        // 4. Cập nhật Role
        if (request.getRole() != null) {
            try {
                Role role = Role.valueOf(request.getRole().toUpperCase());
                user.setRole(role);
            } catch (IllegalArgumentException e) {
                throw new RuntimeException("Role không hợp lệ (Chỉ nhận CUSTOMER, EMPLOYEE, ADMIN)");
            }
        }

        // 5. Cập nhật Mật khẩu (Nếu admin muốn đổi pass cho nhân viên/khách)
        if (request.getPassword() != null && !request.getPassword().trim().isEmpty()) {
            user.setPassword(passwordEncoder.encode(request.getPassword()));
        }

        // Không cần gọi userRepository.save(user) vì đã có @Transactional lo việc đó!
    }
}