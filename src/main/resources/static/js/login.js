function getAuthToken(data) {
    return data.access_token || data.accessToken || data.token || data.jwt || '';
}

function getRefreshToken(data) {
    return data.refresh_token || data.refreshToken || '';
}

function saveAuthSession(data) {
    const accessToken = getAuthToken(data);
    const refreshToken = getRefreshToken(data);
    const userRole = data.user?.role || data.role;

    if (accessToken) {
        localStorage.setItem('jwt_token', accessToken);
        localStorage.setItem('access_token', accessToken);
    }

    if (refreshToken) localStorage.setItem('refresh_token', refreshToken);
    if (userRole) localStorage.setItem('user_role', userRole);

    return userRole;
}

// Bắt sự kiện khi người dùng click vào nút Đăng nhập
const loginButton = document.getElementById('button-dang-nhap');
if (loginButton) {
    loginButton.addEventListener('click', async function(e) {
        e.preventDefault(); // Ngăn chặn form tự động tải lại trang

        // Lấy thông tin người dùng nhập vào
        const usernameInput = document.getElementById('username').value;
        const passwordInput = document.getElementById('password').value;

        if(!usernameInput || !passwordInput) {
            alert("Vui lòng nhập đầy đủ tài khoản và mật khẩu!");
            return;
        }

        try {
            const data = window.HTApi
                ? await HTApi.auth.login({
                    username: usernameInput,
                    password: passwordInput
                })
                : await fetch('/api/auth/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        username: usernameInput,
                        password: passwordInput
                    })
                }).then((response) => {
                    if (!response.ok) throw new Error('Sai tài khoản hoặc mật khẩu');
                    return response.json();
                });

            const userRole = saveAuthSession(data);

            if (userRole === 'ADMIN') {
                window.location.href = '/Admin_Dashboard/dashboard.html';
            } else if (userRole === 'EMPLOYEE') {
                window.location.href = '/Staff_Dashboard/dashboard.html';
            } else if (userRole === 'CUSTOMER') {
                window.location.href = '/index.html';
            } else {
                throw new Error('Không xác định được vai trò tài khoản');
            }
        } catch(error) {
            console.error('Lỗi đăng nhập:', error);
            alert('Đăng nhập thất bại: Vui lòng kiểm tra lại tài khoản và mật khẩu!');
        }
    });
}

const registerButton = document.getElementById('button-dang-ky');
if (registerButton) {
    registerButton.addEventListener('click', async function(e) {
        e.preventDefault();

        const username = document.getElementById('ho-va-ten')?.value.trim();
        const email = document.getElementById('Email')?.value.trim();
        const phoneNumber = document.getElementById('sdt')?.value.trim();
        const password = document.getElementById('password')?.value;

        if (!username || !email || !phoneNumber || !password) {
            alert('Vui lòng nhập đầy đủ thông tin đăng ký!');
            return;
        }

        try {
            await HTApi.auth.register({
                username,
                email,
                phoneNumber,
                password
            });
            alert('Đăng ký thành công. Vui lòng đăng nhập.');
            window.location.href = 'login.html';
        } catch (error) {
            console.error('Lỗi đăng ký:', error);
            alert(error.message || 'Đăng ký thất bại.');
        }
    });
}
