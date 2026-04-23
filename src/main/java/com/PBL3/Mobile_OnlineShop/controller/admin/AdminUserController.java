package com.PBL3.Mobile_OnlineShop.controller.admin;

import com.PBL3.Mobile_OnlineShop.dto.request.StaffCreateRequest;
import com.PBL3.Mobile_OnlineShop.dto.request.UserUpdateRequest;
import com.PBL3.Mobile_OnlineShop.dto.response.PaginatedResponse;
import com.PBL3.Mobile_OnlineShop.dto.response.UserDetailResponse;
import com.PBL3.Mobile_OnlineShop.dto.response.UserResponse;
import com.PBL3.Mobile_OnlineShop.service.UserService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/users")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AdminUserController {

    private final UserService userService;

    @GetMapping
    public ResponseEntity<PaginatedResponse<UserResponse>> getUsers(
            @RequestParam(required = false) String role,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "user_id") String sort_by,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int limit) {

        PaginatedResponse<UserResponse> response = userService.getUsers(role, search, sort_by, page, limit);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{user_id}")
    public ResponseEntity<UserDetailResponse> getUserDetail(@PathVariable("user_id") Long userId) {
        UserDetailResponse response = userService.getUserDetail(userId);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/staff")
    public ResponseEntity<Map<String, String>> createStaff(@Valid @RequestBody StaffCreateRequest request) {
        String message = userService.createStaff(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("message", message));
    }

    @PatchMapping("/{user_id}")
    public ResponseEntity<Map<String, String>> updateUser(
            @PathVariable("user_id") Long userId,
            @Valid @RequestBody UserUpdateRequest request) {

        userService.updateUser(userId, request);
        return ResponseEntity.ok(Map.of("message", "Cập nhật thành công"));
    }
}