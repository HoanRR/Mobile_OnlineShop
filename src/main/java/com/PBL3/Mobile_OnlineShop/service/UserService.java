package com.PBL3.Mobile_OnlineShop.service;

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

public interface UserService {
    void register(UserRegisterRequest request);

    LoginResponse login(LoginRequest request);

    public void logout(String token);

    RefreshTokenResponse refreshAccessToken(RefreshTokenRequest request);

    PaginatedResponse<UserResponse> getUsers(String roleStr, String search, String sortBy, int page, int limit);

    UserDetailResponse getUserDetail(Long userId);

    String createStaff(StaffCreateRequest request);

    void updateUser(Long userId, UserUpdateRequest request);

}