package com.PBL3.Mobile_OnlineShop.controller.admin;

import com.PBL3.Mobile_OnlineShop.Service.UserService;
import com.PBL3.Mobile_OnlineShop.dto.response.GetUserResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

//api/admin/users/**
@RestController
@RequestMapping("/api/admin/user")
@PreAuthorize("hasAuthority('ADMIN')")
@RequiredArgsConstructor
public class AdminUserController {
    UserService userService;
    @GetMapping("/{user_id}")
    public ResponseEntity<GetUserResponse> getUser(@PathVariable ("{user_id}") Long user_id){
        return ResponseEntity.ok(userService.getUser(user_id));
    }
}
