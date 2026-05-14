function getAuthToken(data) {
    return data.access_token || data.accessToken || data.token || data.jwt || '';
}

function getRefreshToken(data) {
    return data.refresh_token || data.refreshToken || '';
}

function normalizeRole(role) {
    const value = String(role || '').trim().toUpperCase();
    if (value === 'ADMIN') return 'ADMIN';
    if (value === 'EMPLOYEE' || value === 'STAFF' || value === 'NHANVIEN') return 'EMPLOYEE';
    if (value === 'CUSTOMER' || value === 'USER' || value === 'KHACHHANG') return 'CUSTOMER';
    return '';
}

function inferDemoRole(username) {
    const value = String(username || '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .trim();

    if (value.includes('admin') || value === 'ad') return 'ADMIN';
    if (value.includes('staff') || value.includes('employee') || value.includes('nhanvien') || value.startsWith('nv') || value.startsWith('sv')) {
        return 'EMPLOYEE';
    }
    return 'CUSTOMER';
}

function demoLogin(username) {
    const role = inferDemoRole(username);
    return {
        access_token: `demo-access-token-${Date.now()}`,
        refresh_token: `demo-refresh-token-${Date.now()}`,
        user: {
            user_id: Date.now(),
            username,
            role
        }
    };
}

function saveAuthSession(data) {
    const accessToken = getAuthToken(data);
    const refreshToken = getRefreshToken(data);
    const userRole = normalizeRole(data.user?.role || data.role);

    if (accessToken) {
        localStorage.setItem('jwt_token', accessToken);
        localStorage.setItem('access_token', accessToken);
    }

    if (refreshToken) localStorage.setItem('refresh_token', refreshToken);
    if (userRole) localStorage.setItem('user_role', userRole);

    return userRole;
}

function loginRedirectByRole(role) {
    const userRole = normalizeRole(role);

    if (userRole === 'ADMIN') return 'Admin_Dashboard/dashboard.html';
    if (userRole === 'EMPLOYEE') return 'Staff_Dashboard/dashboard.html';
    return 'index.html';
}

async function requestLogin(username, password) {
    if (window.HTApi?.isEnabled()) {
        return HTApi.auth.login({ username, password });
    }

    return demoLogin(username);
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
            const data = await requestLogin(usernameInput, passwordInput);
            const userRole = saveAuthSession(data);

            if (!userRole) {
                throw new Error('Không xác định được vai trò tài khoản');
            }

            window.location.href = loginRedirectByRole(userRole);
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
