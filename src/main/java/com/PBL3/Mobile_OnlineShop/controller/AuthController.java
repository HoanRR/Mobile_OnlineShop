package com.PBL3.Mobile_OnlineShop.controller;

import com.PBL3.Mobile_OnlineShop.Service.AuthService;
import com.PBL3.Mobile_OnlineShop.dto.reponse.IntrospectResponse;
import com.PBL3.Mobile_OnlineShop.dto.reponse.LoginResponse;
import com.PBL3.Mobile_OnlineShop.dto.reponse.MessageResponse;
import com.PBL3.Mobile_OnlineShop.dto.reponse.RefreshTokenResponse;
import com.PBL3.Mobile_OnlineShop.dto.reponse.RegisterReponse;
import com.PBL3.Mobile_OnlineShop.dto.request.IntrospectRequest;
import com.PBL3.Mobile_OnlineShop.dto.request.LoginRequest;
import com.PBL3.Mobile_OnlineShop.dto.request.LogoutRequest;
import com.PBL3.Mobile_OnlineShop.dto.request.RefreshTokenRequest;
import com.PBL3.Mobile_OnlineShop.dto.request.UserRegisterRequest;
import com.nimbusds.jose.JOSEException;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.text.ParseException;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<RegisterReponse> register(@Valid @RequestBody UserRegisterRequest request) {
        RegisterReponse response = authService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest request) throws ParseException, JOSEException {
        LoginResponse response = authService.login(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/refresh")
    public ResponseEntity<RefreshTokenResponse> refresh(@Valid @RequestBody RefreshTokenRequest request) {
        RefreshTokenResponse response = authService.refreshToken(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/logout")
    public ResponseEntity<MessageResponse> logout(@Valid @RequestBody LogoutRequest request) throws ParseException, JOSEException {
        authService.logout(request);
        return ResponseEntity.ok(
                MessageResponse.builder()
                        .message("Đăng xuất thành công")
                        .build()
        );
    }

    @PostMapping("/introspect")
    public ResponseEntity<IntrospectResponse> introspect(@Valid @RequestBody IntrospectRequest request) throws ParseException, JOSEException {
        IntrospectResponse response = authService.introspect(request);
        return ResponseEntity.ok(response);
    }
}
