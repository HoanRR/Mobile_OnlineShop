package com.PBL3.Mobile_OnlineShop.controller.admin;

import com.PBL3.Mobile_OnlineShop.Service.UserService;
import com.PBL3.Mobile_OnlineShop.dto.request.CreateAccountRequest;
import com.PBL3.Mobile_OnlineShop.dto.request.UpdateUserRequest;
import com.PBL3.Mobile_OnlineShop.dto.response.MessageResponse;
import com.PBL3.Mobile_OnlineShop.dto.response.PaginatedResponse;
import com.PBL3.Mobile_OnlineShop.dto.response.UserDetailResponse;
import com.PBL3.Mobile_OnlineShop.dto.response.UserResponse;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

//api/admin/users/**
@RestController
@RequestMapping("/api/admin/user")
@PreAuthorize("hasAuthority('ADMIN')")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)

public class AdminUserController {
    UserService userService;
    @GetMapping("/{user_id}")
    public ResponseEntity<UserDetailResponse> getUserdetail(@PathVariable ("{user_id}") Long user_id){
        return ResponseEntity.ok(userService.getUser(user_id));
    }
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

    @PostMapping
    public ResponseEntity<MessageResponse> CreateAccount(@Valid @RequestBody CreateAccountRequest request){
        MessageResponse message = userService.createAccount(request);
        return ResponseEntity.ok(message);
    }

    @PatchMapping("/{user_id}")
    public ResponseEntity<MessageResponse> updateUser(
            @PathVariable("user_id") Long userId,
            @Valid @RequestBody UpdateUserRequest request) {

        userService.updateUser(userId, request);
        return ResponseEntity.ok(MessageResponse.builder().message("Cập nhập thành công").build());
    }
}
