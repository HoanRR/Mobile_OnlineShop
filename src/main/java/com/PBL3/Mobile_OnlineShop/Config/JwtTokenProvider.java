package com.PBL3.Mobile_OnlineShop.Config;

import com.PBL3.Mobile_OnlineShop.Exeption.AppException;
import com.PBL3.Mobile_OnlineShop.Exeption.ErrorCode;
import com.PBL3.Mobile_OnlineShop.Repository.InvalidatedTokenRepository;
import com.PBL3.Mobile_OnlineShop.Repository.UserRepository;
import com.nimbusds.jose.*;
import com.nimbusds.jose.crypto.MACSigner;
import com.nimbusds.jose.crypto.MACVerifier;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.SignedJWT;
import com.PBL3.Mobile_OnlineShop.entity.User;
import lombok.RequiredArgsConstructor;
import lombok.experimental.NonFinal;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.text.ParseException;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Date;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class JwtTokenProvider {

    @NonFinal
    @Value("${jwt.signerKey}")
    protected String SIGNER_KEY;

    private final InvalidatedTokenRepository invalidatedTokenRepository;
    private final UserRepository userRepository;

    private static final long ACCESS_TOKEN_EXPIRY_HOURS = 2;

    public String generateToken(User user) {
        try {
            JWTClaimsSet claimsSet = new JWTClaimsSet.Builder()
                    .subject(user.getUsername())
                    .issuer("phoneshop.vn")
                    .issueTime(new Date())
                    .expirationTime(Date.from(
                            Instant.now().plus(ACCESS_TOKEN_EXPIRY_HOURS, ChronoUnit.HOURS)))
                    .jwtID(UUID.randomUUID().toString())
                    .claim("scope", user.getRole().name())
                    .claim("userId", user.getUserId())
                    .build();

            JWSHeader header = new JWSHeader(JWSAlgorithm.HS512);
            SignedJWT signedJWT = new SignedJWT(header, claimsSet);
            signedJWT.sign(new MACSigner(SIGNER_KEY.getBytes()));

            return signedJWT.serialize();
        } catch (JOSEException e) {
            throw new RuntimeException("Không thể tạo token", e);
        }
    }

    /**
     * Xác minh token JWT
     * @param token - JWT string
     * @param isRefresh - nếu true, cho phép token đã hết hạn (dùng cho refresh flow)
     */
    public SignedJWT verifyToken(String token, boolean isRefresh) throws JOSEException, ParseException {
        JWSVerifier verifier = new MACVerifier(SIGNER_KEY.getBytes());

        SignedJWT signedJWT = SignedJWT.parse(token);

        // Kiểm tra chữ ký
        var verified = signedJWT.verify(verifier);
        if (!verified)
            throw new AppException(ErrorCode.UNAUTHENTICATED);
        Date expiryTime = signedJWT.getJWTClaimsSet().getExpirationTime();
        // Kiểm tra hết hạn - bỏ qua nếu là refresh
        if (!isRefresh && expiryTime.before(new Date()))
            throw new AppException(ErrorCode.UNAUTHENTICATED);

        // Kiểm tra token đã bị vô hiệu hóa (logout) chưa
        if (invalidatedTokenRepository
                .existsById(signedJWT.getJWTClaimsSet().getJWTID()))
            throw new AppException(ErrorCode.UNAUTHENTICATED);

        // Kiểm tra xem token này có được phát hành trước khi người dùng đổi mật khẩu gần nhất không
        String username = signedJWT.getJWTClaimsSet().getSubject();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new AppException(ErrorCode.UNAUTHENTICATED));

        Date issueTime = signedJWT.getJWTClaimsSet().getIssueTime();
        if (user.getPasswordChangedAt() != null && issueTime != null) {
            if (issueTime.before(user.getPasswordChangedAt())) {
                throw new AppException(ErrorCode.UNAUTHENTICATED);
            }
        }

        return signedJWT;
    }

    /**
     * Overload cho các chỗ gọi bình thường (không phải refresh)
     */
    public SignedJWT verifyToken(String token) throws JOSEException, ParseException {
        return verifyToken(token, false);
    }
}
