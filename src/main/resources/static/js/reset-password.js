
document.addEventListener('DOMContentLoaded', function () {
    const step1 = document.getElementById('step-1');
    const step2 = document.getElementById('step-2');
    const emailInput = document.getElementById('dia-chi-email');
    const otpInput = document.getElementById('otp-code');
    const newPasswordInput = document.getElementById('new-password');
    const confirmPasswordInput = document.getElementById('confirm-password');

    const btnSendOtp = document.getElementById('btn-send-otp');
    const btnResetPassword = document.getElementById('btn-reset-password');
    const btnBackStep1 = document.getElementById('btn-back-step-1');

    // Step 1: Gửi yêu cầu OTP
    btnSendOtp.addEventListener('click', async function (e) {
        e.preventDefault();
        const email = emailInput.value.trim();
        let error_message = document.getElementById('error-message');

        if (!email || !validateEmail(email)) {
            error_message.style.display = 'block';
            error_message.innerText = 'Vui lòng nhập địa chỉ email hợp lệ.';
            return;
        }
        document.getElementById('error-message').style.display = 'none';
        btnSendOtp.disabled = true;
        btnSendOtp.innerText = 'Đang gửi...';

        try {
            const response = await fetch('http://localhost:8080/api/auth/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: email })
            });

            const data = await response.json();
            if (response.ok) {
                step1.style.display = 'none';
                step2.style.display = 'block';
                document.getElementById('otp-sent-msg').innerText = `Mã OTP đã được gửi về email: ${email}`;
            } else {
                alert(data.message || 'Có lỗi xảy ra khi gửi OTP.');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Lỗi kết nối server.');
        } finally {
            btnSendOtp.disabled = false;
            btnSendOtp.innerText = 'Gửi mã OTP';
        }
    });

    // Step 2: Xác nhận đổi mật khẩu
    btnResetPassword.addEventListener('click', async function (e) {
        e.preventDefault();
        const email = emailInput.value.trim();
        const otp = otpInput.value.trim();
        const newPassword = newPasswordInput.value;
        const confirmPassword = confirmPasswordInput.value;

        if (!otp || otp.length < 6) {
            alert('Vui lòng nhập mã OTP 6 chữ số.');
            return;
        }

        if (newPassword.length < 6) {
            alert('Mật khẩu mới phải có ít nhất 6 ký tự.');
            return;
        }

        if (newPassword !== confirmPassword) {
            alert('Xác nhận mật khẩu không khớp.');
            return;
        }

        btnResetPassword.disabled = true;
        btnResetPassword.innerText = 'Đang xử lý...';

        try {
            const response = await fetch('http://localhost:8080/api/auth/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: email,
                    otp: otp,
                    new_password: newPassword
                })
            });

            const data = await response.json();

            if (response.ok) {
                alert('Đặt lại mật khẩu thành công! Bạn có thể đăng nhập bằng mật khẩu mới.');
                window.location.href = 'login.html';
            } else {
                alert(data.message || 'Mã OTP không đúng hoặc đã hết hạn.');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Lỗi kết nối server.');
        } finally {
            btnResetPassword.disabled = false;
            btnResetPassword.innerText = 'Xác nhận thay đổi';
        }
    });

    btnBackStep1.addEventListener('click', function (e) {
        e.preventDefault();
        step2.style.display = 'none';
        step1.style.display = 'block';
    });

    function validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }
});
