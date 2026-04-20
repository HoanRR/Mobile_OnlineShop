package com.PBL3.Mobile_OnlineShop.service.impl;

import com.PBL3.Mobile_OnlineShop.dto.request.LoginRequest;
import com.PBL3.Mobile_OnlineShop.dto.request.RefreshTokenRequest;
import com.PBL3.Mobile_OnlineShop.dto.request.UserRegisterRequest;
import com.PBL3.Mobile_OnlineShop.dto.response.LoginResponse;
import com.PBL3.Mobile_OnlineShop.dto.response.RefreshTokenResponse;
import com.PBL3.Mobile_OnlineShop.entity.Cart;
import com.PBL3.Mobile_OnlineShop.entity.User;
import com.PBL3.Mobile_OnlineShop.repository.UserRepository;
import com.PBL3.Mobile_OnlineShop.service.UserService;
import com.PBL3.Mobile_OnlineShop.util.JwtUtil;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.PBL3.Mobile_OnlineShop.enums.Role;
import org.springframework.security.crypto.password.PasswordEncoder;
import java.time.LocalDateTime;

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
}