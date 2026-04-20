package com.PBL3.Mobile_OnlineShop.controller;

import com.PBL3.Mobile_OnlineShop.dto.request.LoginRequest;
import com.PBL3.Mobile_OnlineShop.dto.request.RefreshTokenRequest;
import com.PBL3.Mobile_OnlineShop.dto.request.UserRegisterRequest;
import com.PBL3.Mobile_OnlineShop.dto.response.LoginResponse;
import com.PBL3.Mobile_OnlineShop.dto.response.RefreshTokenResponse;
import com.PBL3.Mobile_OnlineShop.service.UserService;
import com.PBL3.Mobile_OnlineShop.util.JwtUtil;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import java.util.HashMap;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AuthController {

    private final UserService userService;
    private final JwtUtil jwtUtil;

    @PostMapping("/register")
    public ResponseEntity<?> registerCustomer(@Valid @RequestBody UserRegisterRequest request) {
        try {
            // Gọi service xử lý
            userService.register(request);

            // Nếu thành công, trả về status 201 và chuỗi văn bản yêu cầu
            return ResponseEntity.status(HttpStatus.CREATED).body("Registration successful");

        } catch (IllegalStateException e) {
            // Bắt chính xác lỗi trùng Email/SĐT ở Service ném ra -> Trả về mã 409 Conflict
            return ResponseEntity.status(HttpStatus.CONFLICT).body(e.getMessage());

        } catch (Exception e) {
            // Các lỗi hệ thống khác
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        try {
            LoginResponse response = userService.login(request);
            return ResponseEntity.ok(response); // status 200 OK
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(e.getMessage());
        }
    }

    @PostMapping("/refresh")
    public ResponseEntity<?> refresh(@RequestBody RefreshTokenRequest request) {
        try {
            RefreshTokenResponse response = userService.refreshAccessToken(request);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            // Lỗi token (hết hạn, sai chữ ký...) thì trả về 401 Unauthorized bắt user đăng
            // nhập lại
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(e.getMessage());
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpServletRequest request) {
        // 1. Lấy Token từ Header của Request gửi lên
        String authHeader = request.getHeader("Authorization");

        // 2. Kiểm tra xem Header có chứa Token hợp lệ không (Bắt đầu bằng chữ "Bearer
        // ")
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7); // Cắt bỏ chữ "Bearer " (7 ký tự) để lấy phần mã lõi

            // 3. Đưa Token này vào Sổ đen để vô hiệu hóa
            jwtUtil.invalidateToken(token);
        }

        // 4. Trả về đúng định dạng JSON yêu cầu: { "message": "Đăng xuất thành công" }
        Map<String, String> response = new HashMap<>();
        response.put("message", "Đăng xuất thành công");

        return ResponseEntity.ok(response);
    }

}