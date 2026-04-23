package com.PBL3.Mobile_OnlineShop.config;

import com.PBL3.Mobile_OnlineShop.repository.InvalidatedTokenRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtException;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.stereotype.Component;

import javax.crypto.spec.SecretKeySpec;
import java.util.Objects;

@Component
public class CustomJwtDecoder implements JwtDecoder {

    @Value("${jwt.signerKey}")
    private String signerKey;

    // Tiêm Sổ đen vào đây
    @Autowired
    private InvalidatedTokenRepository invalidatedTokenRepository;

    private NimbusJwtDecoder nimbusJwtDecoder = null;

    @Override
    public Jwt decode(String token) throws JwtException {

        // 1. KIỂM TRA SỔ ĐEN (BLACKLIST)
        // Nếu cái token này đang nằm trong Database -> Ném Exception từ chối ngay lập
        // tức!
        if (invalidatedTokenRepository.existsByToken(token)) {
            throw new JwtException("Token đã bị vô hiệu hóa (Đăng xuất)!");
        }

        // 2. TIẾN HÀNH GIẢI MÃ NHƯ BÌNH THƯỜNG
        if (Objects.isNull(nimbusJwtDecoder)) {
            SecretKeySpec secretKeySpec = new SecretKeySpec(signerKey.getBytes(), "HS256");
            nimbusJwtDecoder = NimbusJwtDecoder
                    .withSecretKey(secretKeySpec)
                    .macAlgorithm(MacAlgorithm.HS256)
                    .build();
        }

        try {
            // Nimbus sẽ tự động dịch
            return nimbusJwtDecoder.decode(token);
        } catch (Exception e) {
            // THÊM 2 DÒNG NÀY VÀO ĐỂ XEM LỖI THỰC SỰ LÀ GÌ:
            System.out.println("❌ LỖI GIẢI MÃ TOKEN: " + e.getMessage());
            e.printStackTrace();

            throw new JwtException("Token không hợp lệ hoặc đã hết hạn: " + e.getMessage());
        }
    }
}