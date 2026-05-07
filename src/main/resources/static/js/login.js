// Bắt sự kiện khi người dùng click vào nút Đăng nhập
document.getElementById('button-dang-nhap').addEventListener('click', function(e) {
    e.preventDefault(); // Ngăn chặn form tự động tải lại trang

    // Lấy thông tin người dùng nhập vào
    const usernameInput = document.getElementById('username').value;
    const passwordInput = document.getElementById('password').value;

    if(!usernameInput || !passwordInput) {
        alert("Vui lòng nhập đầy đủ tài khoản và mật khẩu!");
        return;
    }

    fetch('/api/auth/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            username: usernameInput,
            password: passwordInput
        })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Sai tài khoản hoặc mật khẩu');
        }
        return response.json();
    })
    .then(data => {
        // Lấy token và role từ dữ liệu API trả về
        const accessToken = data.access_token;
        const userRole = data.user.role; // Trả về ADMIN, EMPLOYEE, hoặc CUSTOMER

        // Lưu Token vào localStorage để các trang khác lấy ra dùng khi gọi API
        localStorage.setItem('jwt_token', accessToken);
        localStorage.setItem('user_role', userRole);

        // LOGIC PHÂN LUỒNG ĐIỀU HƯỚNG NẰM Ở ĐÂY
        if (userRole === 'ADMIN') {
            // Đẩy vào màn hình của Admin
            window.location.href = '/Admin_Dashboard/dashboard.html'; 
        } 
        else if (userRole === 'EMPLOYEE') {
            // Đẩy vào màn hình của Nhân viên
            window.location.href = '/Staff_Dashboard/dashboard.html'; 
        } 
        else if (userRole === 'CUSTOMER') {
            // Đẩy về Trang chủ mua sắm
            window.location.href = '/index.html'; 
        }
    })
    .catch(error => {
        console.error('Lỗi đăng nhập:', error);
        alert('Đăng nhập thất bại: Vui lòng kiểm tra lại tài khoản và mật khẩu!');
    });
});