package com.PBL3.Mobile_OnlineShop.controller.user;
//api/me/**

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.PBL3.Mobile_OnlineShop.Service.UserService;
import com.PBL3.Mobile_OnlineShop.dto.response.MyInfoResponse;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.GetMapping;


@RestController
@RequestMapping("/api/me")
@FieldDefaults(level = AccessLevel.PRIVATE , makeFinal = true)
@RequiredArgsConstructor
@PreAuthorize("hasauthority('CUSTOMER')")
public class UserController {

    UserService userService;

    @GetMapping("/myInfo")
    public ResponseEntity<MyInfoResponse> getInfoUser(){
        return userService.getMyInfo();
        
    }
}
