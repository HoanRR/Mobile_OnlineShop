package com.PBL3.Mobile_OnlineShop.Service;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class EmailService {
    JavaMailSender mailSender;
        
    public void sendOtp(String to, String otp) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom("zztainguyen1311@gmail.com");
        message.setTo(to);
        message.setSubject("Mã OTP đặt lại mật khẩu - Mobile Shop");
        message.setText("Chào bạn,\n\nMã OTP để đặt lại mật khẩu của bạn là: " + otp + 
                       "\nMã này sẽ hết hạn sau 5 phút. Vui lòng không cung cấp mã này cho bất kỳ ai.\n\nTrân trọng,\nMobile Shop Team");
        mailSender.send(message);
    }
}
