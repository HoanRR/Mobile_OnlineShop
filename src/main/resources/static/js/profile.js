const API_ME_URL = 'http://localhost:8080/api/me';

document.addEventListener("DOMContentLoaded", function () {
    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) {
        alert("Vui lòng đăng nhập để xem thông tin cá nhân!");
        window.location.href = 'login.html';
        return;
    }

    loadProfile();

    const form = document.getElementById('profile-form');
    if (form) {
        form.addEventListener('submit', function (e) {
            e.preventDefault();
            updateProfile();
        });
    }
});

async function loadProfile() {
    const accessToken = localStorage.getItem('accessToken');
    try {
        const response = await fetch(API_ME_URL, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        });

        if (response.status === 401) {
            alert("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại!");
            xuLyDangXuat();
            return;
        }

        if (!response.ok) {
            throw new Error(`Lỗi HTTP: ${response.status}`);
        }

        const data = await response.json();
        
        // Cập nhật giao diện
        document.getElementById('sidebar-name').innerText = data.name || data.username;
        document.getElementById('username').value = data.username;
        document.getElementById('email').value = data.email;
        document.getElementById('full-name').value = data.name || '';
        document.getElementById('phone').value = data.phoneNumber || '';

    } catch (error) {
        console.error("Lỗi khi tải thông tin:", error); 
        showToast("Không thể tải thông tin cá nhân. Vui lòng thử lại sau.", "error");
    }
}

async function updateProfile() {
    const accessToken = localStorage.getItem('accessToken');
    const fullName = document.getElementById('full-name').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const email = document.getElementById('email').value.trim();

    if (!fullName || !phone) {
        showToast("Vui lòng điền đầy đủ họ tên và số điện thoại!", "warning");
        return;
    }

    const requestBody = {
        fullName: fullName,
        phone_number: phone,
        email: email
    };

    try {
        const response = await fetch(API_ME_URL, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        });

        const data = await response.json();

        if (response.ok) {
            showToast("Cập nhật thông tin thành công!", "success");
            
            // Cập nhật lại localStorage để header thay đổi
            let userInfo = JSON.parse(localStorage.getItem('userInfo')) || {};
            userInfo.name = fullName; 
            localStorage.setItem('userInfo', JSON.stringify(userInfo));
            
            document.getElementById('sidebar-name').innerText = fullName;
            capNhatGiaoDienHeader();
        } else {
            showToast(data.message || "Cập nhật thất bại!", "error");
        }
    } catch (error) {
        console.error("Lỗi cập nhật:", error);
        showToast("Lỗi kết nối đến máy chủ. Vui lòng thử lại.", "error");
    }
}
