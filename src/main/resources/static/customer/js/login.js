// Hàm dùng chung để hiển thị lỗi trên UI
function showAuthError(message) {
    const errorDiv = document.getElementById('error-message');
    if (errorDiv) {
        errorDiv.innerText = message;
        errorDiv.style.display = 'block';
    } else {
        alert(message);
    }
}

// Xử lý đăng nhập
async function xuLyDangNhap(event) {
    event.preventDefault();

    const tenDangNhap = document.getElementById('username').value.trim();
    const matKhau = document.getElementById('password').value.trim();

    if (!tenDangNhap || !matKhau) {
        showAuthError('Vui lòng nhập đầy đủ thông tin!');
        return;
    }

    try {
        const response = await fetch('http://localhost:8080/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: tenDangNhap,
                password: matKhau
            })
        });

        if (response.ok) {
            const data = await response.json();
            // Lưu token theo chuẩn API contract (access_token) hoặc fallback
            localStorage.setItem('accessToken', data.access_token || data.token);
            localStorage.setItem('userInfo', JSON.stringify(data));
            
            typeof showToast !== 'undefined' ? showToast("Đăng nhập thành công!", "success") : alert("Đăng nhập thành công!");
            
            let userRole = "CUSTOMER";
            if (data.user && data.user.role) {
                userRole = data.user.role;
            } else if (data.role) {
                userRole = data.role;
            }
            
            // Chuyển hướng sau 1s theo role (3 hướng)
            setTimeout(() => {
                if (userRole === "ADMIN") {
                    window.location.href = '../admin/index_admin.html';
                } else if (userRole === "EMPLOYEE" || userRole === "STAFF") {
                    window.location.href = '../staff/pos.html';
                } else {
                    window.location.href = 'index.html';
                }
            }, 1000);

        } else {
            showAuthError('Tài khoản hoặc mật khẩu không chính xác!');
        }
    } catch (error) {
        console.error('Lỗi kết nối Backend:', error);
        showAuthError('Hệ thống đang bảo trì, vui lòng thử lại sau.');
    }
}

// Xử lý đăng ký
async function xuLyDangKy(event) {
    event.preventDefault();

    const username = document.getElementById('reg-username').value.trim();
    const fullname = document.getElementById('reg-fullname').value.trim();
    const email = document.getElementById('reg-email').value.trim();
    const phone = document.getElementById('reg-phone').value.trim();
    const password = document.getElementById('reg-password').value.trim();

    if (!username || !fullname || !email || !phone || !password) {
        showAuthError("Vui lòng điền đầy đủ các thông tin!");
        return;
    }

    if (password.length < 6) {
        showAuthError("Mật khẩu phải có ít nhất 6 ký tự!");
        return;
    }

    const btnSubmit = document.getElementById('btn-submit-register');
    const oldText = btnSubmit.innerText;
    btnSubmit.innerText = "Đang xử lý...";
    btnSubmit.disabled = true;

    try {
        const response = await fetch('http://localhost:8080/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: username,
                full_name: fullname,
                email: email,
                phone_number: phone,
                password: password
            })
        });

        if (response.ok) {
            typeof showToast !== 'undefined' ? showToast("Đăng ký thành công! Vui lòng đăng nhập.", "success") : alert("Đăng ký thành công!");
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 1500);
        } else {
            const errData = await response.json();
            showAuthError(errData.message || "Đăng ký thất bại. Tên đăng nhập, email hoặc SĐT có thể đã tồn tại!");
            btnSubmit.innerText = oldText;
            btnSubmit.disabled = false;
        }
    } catch (error) {
        console.error('Lỗi kết nối Backend:', error);
        showAuthError('Không thể kết nối đến máy chủ. Vui lòng thử lại sau.');
        btnSubmit.innerText = oldText;
        btnSubmit.disabled = false;
    }
}

// Xử lý Quên mật khẩu
async function xuLyQuenMatKhau(event) {
    event.preventDefault();
    const email = document.getElementById('reset-email').value.trim();
    
    if (!email) {
        showAuthError("Vui lòng nhập Email!");
        return;
    }

    const btnSubmit = document.getElementById('btn-submit-reset');
    btnSubmit.innerText = "Đang gửi...";
    btnSubmit.disabled = true;

    setTimeout(() => {
        showToast ? showToast("Đã gửi hướng dẫn khôi phục qua Email của bạn!", "success") : alert("Đã gửi hướng dẫn!");
        document.getElementById('error-message').style.display = 'none';
        
        btnSubmit.innerText = "Đã gửi thành công";
        
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 3000);
    }, 1500);
}
