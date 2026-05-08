
async function xuLyDangNhap(event) {
    event.preventDefault(); // Ngăn form tải lại trang

    const tenDangNhap = document.getElementById('username').value;
    const matKhau = document.getElementById('password').value;

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
            
            localStorage.setItem('accessToken', data.token); 
            localStorage.setItem('userInfo', JSON.stringify(data)); 

            
            window.location.href = 'index.html'; 
            
        } else {
            alert('Sai tên đăng nhập hoặc mật khẩu!');
        }
    } catch (error) {
        console.error('Lỗi kết nối Backend:', error);
        alert('Hệ thống đang bảo trì, vui lòng thử lại sau.');
    }
}

