package com.PBL3.Mobile_OnlineShop.util;

import com.PBL3.Mobile_OnlineShop.entity.User;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;
import java.util.HashSet;
import java.util.Set;

@Component
public class JwtUtil {

    // Lấy các giá trị từ file application.properties
    @Value("${jwt.secret}")
    private String secretKey;

    @Value("${jwt.access-expiration}")
    private long accessTokenExpiration;

    @Value("${jwt.refresh-expiration}")
    private long refreshTokenExpiration;

    // Hàm chuyển đổi chuỗi Secret thành đối tượng Key mã hóa
    private Key getSignInKey() {
        byte[] keyBytes = Decoders.BASE64.decode(secretKey);
        return Keys.hmacShaKeyFor(keyBytes);
    }

    // Sinh Access Token (Có chứa thông tin Role, UserId để sau này phân quyền)
    public String generateAccessToken(User user) {
        return Jwts.builder()
                .setSubject(user.getUsername()) // Subject thường là username hoặc email
                .claim("userId", user.getUserId()) // Cất thêm ID vào bụng Token
                .claim("role", user.getRole().name()) // Cất thêm Quyền vào bụng Token
                .setIssuedAt(new Date()) // Thời gian phát hành
                .setExpiration(new Date(System.currentTimeMillis() + accessTokenExpiration)) // Thời gian hết hạn
                .signWith(getSignInKey(), SignatureAlgorithm.HS256) // Chữ ký bảo mật
                .compact();
    }

    // Sinh Refresh Token (Không cần chứa nhiều thông tin, chỉ cần sống lâu)
    public String generateRefreshToken(User user) {
        return Jwts.builder()
                .setSubject(user.getUsername())
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + refreshTokenExpiration))
                .signWith(getSignInKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    // Hàm trích xuất Username (Subject) từ bụng Token
    public String extractUsername(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSignInKey())
                .build()
                .parseClaimsJws(token)
                .getBody()
                .getSubject();
    }

    // 1. Tạo một "Sổ bìa đen" lưu trong RAM của Server
    private Set<String> blacklistedTokens = new HashSet<>();

    // 2. Hàm đưa Token vào danh sách đen (Dùng cho Logout)
    public void invalidateToken(String token) {
        blacklistedTokens.add(token);
    }

    // 3. SỬA LẠI hàm kiểm tra Token: Phải check xem có nằm trong sổ đen không
    public boolean isTokenValid(String token) {
        // Nếu token nằm trong sổ đen -> Chắc chắn không hợp lệ
        if (blacklistedTokens.contains(token)) {
            return false;
        }

        try {
            Jwts.parserBuilder().setSigningKey(getSignInKey()).build().parseClaimsJws(token);
            return true;
        } catch (Exception e) {
            return false;
        }
    }
}