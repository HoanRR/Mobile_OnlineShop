package com.PBL3.Mobile_OnlineShop.Service;

import org.apache.el.stream.Optional;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import com.PBL3.Mobile_OnlineShop.Exeption.AppException;
import com.PBL3.Mobile_OnlineShop.Exeption.ErrorCode;
import com.PBL3.Mobile_OnlineShop.Repository.UserRepository;
import com.PBL3.Mobile_OnlineShop.dto.response.MyInfoResponse;
import com.PBL3.Mobile_OnlineShop.entity.User;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class UserService {
    UserRepository userRepository;

    public ResponseEntity<MyInfoResponse> getMyInfo() {
        var authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        User userInfo = userRepository.findByUsername(username)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND, "Không tìm thấy thông tin cá nhân"));
    
        MyInfoResponse userResponse = MyInfoResponse.builder()
                        .userId(userInfo.getUserId())
                        .username(userInfo.getUsername())
                        .name(userInfo.getName())
                        .email(userInfo.getEmail())
                        .phoneNumber(userInfo.getPhoneNumber())
                        .roles(userInfo.getRoles())
                        .build();

        return ResponseEntity.status(HttpStatus.ACCEPTED).body(userResponse);
    }

}
