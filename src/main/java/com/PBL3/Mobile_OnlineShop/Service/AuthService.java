package com.PBL3.Mobile_OnlineShop.Service;

import com.PBL3.Mobile_OnlineShop.Config.JwtTokenProvider;
import com.PBL3.Mobile_OnlineShop.Exeption.AppException;
import com.PBL3.Mobile_OnlineShop.Exeption.ErrorCode;
import com.PBL3.Mobile_OnlineShop.Repository.InvalidatedTokenRepository;
import com.PBL3.Mobile_OnlineShop.Repository.UserRepository;
import com.PBL3.Mobile_OnlineShop.dto.response.IntrospectResponse;
import com.PBL3.Mobile_OnlineShop.dto.response.LoginResponse;
import com.PBL3.Mobile_OnlineShop.dto.response.RefreshTokenResponse;
import com.PBL3.Mobile_OnlineShop.dto.response.RegisterReponse;
import com.PBL3.Mobile_OnlineShop.dto.request.IntrospectRequest;
import com.PBL3.Mobile_OnlineShop.dto.request.LoginRequest;
import com.PBL3.Mobile_OnlineShop.dto.request.LogoutRequest;
import com.PBL3.Mobile_OnlineShop.dto.request.RefreshTokenRequest;
import com.PBL3.Mobile_OnlineShop.dto.request.RegisterCustomerRequest;
import com.PBL3.Mobile_OnlineShop.entity.InvalidatedToken;
import com.PBL3.Mobile_OnlineShop.entity.User;
import com.PBL3.Mobile_OnlineShop.enums.Role;
import com.nimbusds.jose.JOSEException;
import com.nimbusds.jwt.SignedJWT;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.text.ParseException;
import java.util.Date;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final InvalidatedTokenRepository invalidatedTokenRepository;
    private final PasswordEncoder passwordEncoder = new BCryptPasswordEncoder(10);
    private final JwtTokenProvider jwtTokenProvider;

    @Transactional
    public RegisterReponse register(RegisterCustomerRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new AppException(ErrorCode.USERNAME_EXISTS, "Email hoặc username đã tồn tại");
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new AppException(ErrorCode.EMAIL_EXISTS, "Email hoặc username đã tồn tại");
        }
        if (userRepository.existsByPhoneNumber(request.getPhoneNumber())) {
            throw new AppException(ErrorCode.PHONE_EXISTS, "Số điện thoại đã tồn tại");
        }

        User user = User.builder()
                .username(request.getUsername())
                .email(request.getEmail())
                .fullName(request.getFullName())
                .phoneNumber(request.getPhoneNumber())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(Role.CUSTOMER)
                .build();

        User savedUser = userRepository.save(user);

        return RegisterReponse.builder()
                .userId(savedUser.getUserId())
                .username(savedUser.getUsername())
                .fulname(savedUser.getFullName())
                .email(savedUser.getEmail())
                .role(savedUser.getRole().name())
                .build();
    }

    @Transactional
    public LoginResponse login(LoginRequest request) throws ParseException, JOSEException {
        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new AppException(ErrorCode.INVALID_CREDENTIALS));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new AppException(ErrorCode.INVALID_CREDENTIALS);
        }

        String token = jwtTokenProvider.generateToken(user);

//        var jit = jwtTokenProvider.verifyToken(token);
        return LoginResponse.builder()
                .token(token)
                .user(LoginResponse.UserInfo.builder()
                        .userId(user.getUserId())
                        .username(user.getUsername())
                        .role(user.getRole().name())
                        .build())
                .build();
    }

    @Transactional
    public RefreshTokenResponse refreshToken(RefreshTokenRequest request) {
        try {
            // Verify token cũ, cho phép hết hạn (isRefresh = true)
            SignedJWT signToken = jwtTokenProvider.verifyToken(request.getToken(), true);

            // Invalidate token cũ (đưa vào blacklist)
            String jit = signToken.getJWTClaimsSet().getJWTID();
            Date expiryTime = signToken.getJWTClaimsSet().getExpirationTime();

            InvalidatedToken invalidatedToken = InvalidatedToken.builder()
                    .id(jit)
                    .expiryTime(expiryTime)
                    .build();
            invalidatedTokenRepository.save(invalidatedToken);

            // Cấp token mới
            String username = signToken.getJWTClaimsSet().getSubject();
            User user = userRepository.findByUsername(username)
                    .orElseThrow(() -> new AppException(ErrorCode.UNAUTHENTICATED));

            String newToken = jwtTokenProvider.generateToken(user);

            return RefreshTokenResponse.builder()
                    .token(newToken)
                    .build();
        } catch (AppException e) {
            throw e;
        } catch (Exception e) {
            throw new AppException(ErrorCode.UNAUTHENTICATED);
        }
    }

    @Transactional
    public void logout(LogoutRequest request) throws ParseException, JOSEException {
        var signToken = jwtTokenProvider.verifyToken(request.getToken());

        String jit = signToken.getJWTClaimsSet().getJWTID();
        Date expiryTime = signToken.getJWTClaimsSet().getExpirationTime();

        InvalidatedToken invalidatedToken = InvalidatedToken.builder()
                .id(jit)
                .expiryTime(expiryTime)
                .build();

        invalidatedTokenRepository.save(invalidatedToken);
    }

    public IntrospectResponse introspect(IntrospectRequest request)
            throws JOSEException, ParseException {
        var token = request.getToken();
        boolean isValid = true;

        try {
            jwtTokenProvider.verifyToken(token);
        } catch (AppException e) {
            isValid = false;
        }

        return IntrospectResponse.builder()
                .valid(isValid)
                .build();
    }
}
