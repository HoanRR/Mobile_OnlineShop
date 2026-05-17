package com.PBL3.Mobile_OnlineShop.Service;

import com.PBL3.Mobile_OnlineShop.Exeption.AppException;
import com.PBL3.Mobile_OnlineShop.Exeption.ErrorCode;
import com.PBL3.Mobile_OnlineShop.Repository.UserRepository;
import com.PBL3.Mobile_OnlineShop.dto.request.ForgotPasswordRequest;
import com.PBL3.Mobile_OnlineShop.dto.request.ResetPasswordRequest;
import com.PBL3.Mobile_OnlineShop.entity.User;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.Random;
import java.util.concurrent.ConcurrentHashMap;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class PasswordService {
    UserRepository userRepository;
    EmailService emailService;
    PasswordEncoder passwordEncoder;

    static Map<String, OtpData> otpStorage = new ConcurrentHashMap<>();

    public void requestForgotPassword(ForgotPasswordRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND, "Email không tồn tại trong hệ thống"));

        String otp = String.format("%06d", new Random().nextInt(999999));
        otpStorage.put(request.getEmail(), new OtpData(otp, LocalDateTime.now().plusMinutes(5)));

        emailService.sendOtp(request.getEmail(), otp);
    }

    public void resetPassword(ResetPasswordRequest request) {
        OtpData storedOtp = otpStorage.get(request.getEmail());

        if (storedOtp == null || !storedOtp.otp.equals(request.getOtp())) {
            throw new AppException(ErrorCode.INVALID_DATA, "Mã OTP không chính xác");
        }

        if (LocalDateTime.now().isAfter(storedOtp.expiryTime)) {
            otpStorage.remove(request.getEmail());
            throw new AppException(ErrorCode.INVALID_DATA, "Mã OTP đã hết hạn");
        }

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        user.setPassword(passwordEncoder.encode(request.getNew_password()));
        userRepository.save(user);

        // Xóa OTP sau khi sử dụng thành công
        otpStorage.remove(request.getEmail());
    }

    @RequiredArgsConstructor
    @FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
    static class OtpData {
        String otp;
        LocalDateTime expiryTime;
    }
}
