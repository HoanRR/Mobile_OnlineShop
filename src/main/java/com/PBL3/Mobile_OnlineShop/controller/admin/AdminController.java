package com.PBL3.Mobile_OnlineShop.controller.admin;

import com.PBL3.Mobile_OnlineShop.dto.request.StaffCreateRequest;
import com.PBL3.Mobile_OnlineShop.dto.request.UserUpdateRequest;
import com.PBL3.Mobile_OnlineShop.dto.response.PaginatedResponse;
import com.PBL3.Mobile_OnlineShop.dto.response.RevenueReportResponse;
import com.PBL3.Mobile_OnlineShop.dto.response.UserDetailResponse;
import com.PBL3.Mobile_OnlineShop.dto.response.UserResponse;
import com.PBL3.Mobile_OnlineShop.service.ReportService;
import com.PBL3.Mobile_OnlineShop.service.UserService;
import com.PBL3.Mobile_OnlineShop.service.VoucherService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import java.util.HashMap;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AdminController {

    private final UserService userService;
    private final ReportService reportService;
    private final VoucherService voucherService;

    @GetMapping("/users")
    public ResponseEntity<?> getUsers(
            @RequestParam(required = false) String role,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "user_id") String sort_by,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int limit) {
        PaginatedResponse<UserResponse> response = userService.getUsers(role, search, sort_by, page, limit);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/users/{user_id}")
    public ResponseEntity<?> getUserDetail(@PathVariable("user_id") Long userId) {
        try {
            UserDetailResponse response = userService.getUserDetail(userId);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }

    @PostMapping("/users/staff")
    public ResponseEntity<?> createStaff(@Valid @RequestBody StaffCreateRequest request) {
        try {
            // Gọi Service và lấy câu thông báo trả về
            String message = userService.createStaff(request);

            // Gói vào JSON trả về Frontend
            Map<String, String> response = new HashMap<>();
            response.put("message", message);

            // Trả về mã 201 Created (Tạo thành công)
            return ResponseEntity.status(HttpStatus.CREATED).body(response);

        } catch (IllegalStateException e) {
            // Lỗi trùng lặp dữ liệu -> Trả về 409 Conflict
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("error", e.getMessage()));

        } catch (Exception e) {
            // Các lỗi khác -> Trả về 400 Bad Request
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", e.getMessage()));
        }
    }
    // ...

    @PatchMapping("/users/{user_id}")
    public ResponseEntity<?> updateUser(
            @PathVariable("user_id") Long userId,
            @Valid @RequestBody UserUpdateRequest request) {
        try {
            userService.updateUser(userId, request);

            // Trả về { "message": "Cập nhật thành công" } theo đúng thiết kế
            Map<String, String> response = new HashMap<>();
            response.put("message", "Cập nhật thành công");
            return ResponseEntity.ok(response);

        } catch (IllegalStateException e) {
            // Bắt đúng lỗi "User không tồn tại" để trả về mã 404 Not Found
            if (e.getMessage().equals("User không tồn tại")) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", e.getMessage()));
            }
            // Các lỗi Validate khác (như sai role) thì trả về 400
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", e.getMessage()));

        } catch (RuntimeException e) {
            // Lỗi trùng lặp Số điện thoại / Email thì trả về 409 Conflict
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/reports/revenue")
    public ResponseEntity<?> getRevenueReport(
            @RequestParam(defaultValue = "day") String period,
            @RequestParam String from,
            @RequestParam String to,
            @RequestParam(defaultValue = "DELIVERED") String order_status) {
        try {
            RevenueReportResponse response = reportService.getRevenueReport(period, from, to, order_status);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Lỗi truy xuất báo cáo: " + e.getMessage());
        }
    }

    @PostMapping("/vouchers")
    public ResponseEntity<?> createVoucher(
            @Valid @RequestBody com.PBL3.Mobile_OnlineShop.dto.request.VoucherCreateRequest request) {
        try {
            com.PBL3.Mobile_OnlineShop.dto.response.VoucherResponse response = voucherService.createVoucher(request);
            // Trả về 201 CREATED theo đúng thiết kế
            return ResponseEntity.status(HttpStatus.CREATED).body(response);

        } catch (IllegalStateException e) {
            // Lỗi trùng mã Voucher -> Trả về 409 Conflict
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            // Lỗi Validate hoặc lỗi khác -> Trả về 400 Bad Request
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", e.getMessage()));
        }
    }
}