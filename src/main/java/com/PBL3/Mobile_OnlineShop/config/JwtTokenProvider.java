package com.PBL3.Mobile_OnlineShop.config;

import com.PBL3.Mobile_OnlineShop.entity.User;
import com.nimbusds.jose.*;
import com.nimbusds.jose.crypto.MACSigner;
import com.nimbusds.jwt.JWTClaimsSet;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Date;

@Component
@Slf4j
public class JwtTokenProvider {

    @Value("${jwt.signerKey}")
    private String SIGNER_KEY;

    // 1. Sinh Access Token (Sống 1 giờ)
    public String generateToken(User user) {
        return buildToken(user, 1, ChronoUnit.HOURS);
    }

    // 2. Sinh Refresh Token (Sống 7 ngày)
    public String generateRefreshToken(User user) {
        return buildToken(user, 7, ChronoUnit.DAYS);
    }

    // Hàm dùng chung dùng Nimbus để đúc Token
    private String buildToken(User user, long amount, ChronoUnit unit) {
        try {
            // Header chỉ định thuật toán HS256
            JWSHeader header = new JWSHeader(JWSAlgorithm.HS256);

            // Claims: Chứa dữ liệu của Token
            JWTClaimsSet claimsSet = new JWTClaimsSet.Builder()
                    .subject(user.getEmail()) // Định danh user bằng Email
                    .issuer("mobile-shop.com") // Người phát hành
                    .issueTime(new Date()) // Thời điểm phát hành
                    .expirationTime(Date.from(Instant.now().plus(amount, unit))) // Hạn sử dụng
                    .claim("role", user.getRole().name()) // BỎ QUYỀN VÀO ĐÂY (ADMIN, USER)
                    .claim("userId", user.getUserId()) // Thêm ID để dễ truy xuất
                    .build();

            // Ký Token bằng khóa bí mật
            Payload payload = new Payload(claimsSet.toJSONObject());
            JWSObject jwsObject = new JWSObject(header, payload);
            jwsObject.sign(new MACSigner(SIGNER_KEY.getBytes()));

            return jwsObject.serialize();
        } catch (JOSEException e) {
            log.error("Không thể tạo JWT Token", e);
            throw new RuntimeException("Lỗi hệ thống khi sinh Token");
        }
    }
}