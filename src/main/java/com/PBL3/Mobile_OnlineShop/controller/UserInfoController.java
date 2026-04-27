package com.PBL3.Mobile_OnlineShop.controller;
//api/me/**

import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.PBL3.Mobile_OnlineShop.Service.UserService;
import com.PBL3.Mobile_OnlineShop.dto.request.UpdateMyInfoRequest;
import com.PBL3.Mobile_OnlineShop.dto.request.UpdateMyPasswordRequest;
import com.PBL3.Mobile_OnlineShop.dto.response.MyInfoResponse;

import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.RequestBody;


@RestController
@RequestMapping("/api/me")
@FieldDefaults(level = AccessLevel.PRIVATE , makeFinal = true)
@RequiredArgsConstructor
@PreAuthorize("hasAuthority('CUSTOMER')")
public class UserInfoController {

    UserService userService;

    @GetMapping
    public ResponseEntity<MyInfoResponse> getMyInfo(){
        MyInfoResponse myInfoResponse = userService.getMyInfo();
        return ResponseEntity.ok(myInfoResponse);
        
    }

    @PatchMapping
    public ResponseEntity<String> updateMyInfoPartial(@Valid @RequestBody UpdateMyInfoRequest request){
        userService.updateMyInfoPartial(request);
        return ResponseEntity.ok("Cập nhật thông tin thành công");
    }

    @PatchMapping("/password")
    public ResponseEntity<String> updateMyPasswordPartial(@Valid @RequestBody UpdateMyPasswordRequest UpdateMyPasswordRequest){
        userService.updateMyPasswordPartial(UpdateMyPasswordRequest);
        return ResponseEntity.ok("Cập nhật mật khẩu thành công");
    }
}
