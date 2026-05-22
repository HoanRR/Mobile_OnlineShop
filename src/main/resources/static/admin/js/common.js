
// ===== AUTH HELPERS =====
function getAccessToken() {
    return localStorage.getItem('accessToken');
}

function getAuthHeaders() {
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAccessToken()}`
    };
}

function checkAdminAuth() {
    const token = getAccessToken();
    const userInfo = localStorage.getItem('userInfo');
    if (!token || !userInfo) {
        window.location.href = '../customer/login';
        return false;
    }
    try {
        const data = JSON.parse(userInfo);
        const role = data.user ? data.user.role : data.role;
        if (role !== 'ADMIN') {
            window.location.href = '../customer/login';
            return false;
        }
        // Update admin profile in sidebar
        const nameEl = document.querySelector('.admin-name');
        const avatarEl = document.querySelector('.admin-avatar');
        const uname = data.user ? data.user.username : data.username;
        if (nameEl && uname) nameEl.textContent = uname;
        if (avatarEl && uname) avatarEl.textContent = uname.charAt(0).toUpperCase();
    } catch (e) {
        window.location.href = '../customer/login';
        return false;
    }
    return true;
}

function adminLogout() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('userInfo');
    window.location.href = '../customer/login';
}

function renderStars(rating) {
    if (!rating) return '<span class="rating-stars">☆☆☆☆☆</span><span class="rating-value">--</span>';
    const full = Math.round(rating);
    let s = '';
    for (let i = 0; i < 5; i++) s += i < full ? '★' : '☆';
    return `<span class="rating-stars">${s}</span><span class="rating-value">${rating.toFixed(1)}</span>`;
}

function getStatusBadge(status) {
    if (!status) return '<span class="device-status">--</span>';
    if (status.toUpperCase() === 'INSTOCK') return '<span class="device-status status-instock">Trong kho</span>';
    if (status.toUpperCase() === 'SOLD') return '<span class="device-status status-sold">Đã bán</span>';
    if (status.toUpperCase() === 'DEFECTIVE') return '<span class="device-status status-defective">Lỗi/Hỏng</span>';
    return `<span class="device-status">${status}</span>`;
}
// ===== TOAST =====
function showToast(message, type = 'success') {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        document.body.appendChild(container);
    }
    const toast = document.createElement('div');
    toast.classList.add('toast-msg', type);
    toast.textContent = message;
    container.appendChild(toast);
    setTimeout(() => {
        toast.classList.add('fade-out');
        setTimeout(() => toast.remove(), 400);
    }, 3000);
}

// ===== FORMAT HELPERS =====
function formatCurrency(value) {
    if (value === null || value === undefined) return '--';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
}

function formatNumber(value) {
    if (value === null || value === undefined) return '--';
    return new Intl.NumberFormat('vi-VN').format(value);
}

function formatDateDisplay(dateStr) {
    if (!dateStr) return '--';
    // Handle both yyyy-MM-dd and other formats
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function formatDate(dateStr) {
    if (!dateStr) return '--';
    const d = new Date(dateStr);
    return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
         + ' ' + d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
}

function getRoleName(role) {
    const map = { 'ADMIN': 'Admin', 'EMPLOYEE': 'Nhân viên', 'CUSTOMER': 'Khách hàng' };
    return map[role] || role;
}

function getRoleIcon(role) {
    const map = { 'ADMIN': '🛡️', 'EMPLOYEE': '💼', 'CUSTOMER': '👤' };
    return map[role] || '👤';
}

// ===== SIDEBAR =====
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const main = document.querySelector('.main-content');
    if (window.innerWidth <= 768) {
        sidebar.classList.toggle('mobile-open');
    } else {
        sidebar.classList.toggle('collapsed');
        main.classList.toggle('expanded');
    }
}