// ===== CONSTANTS =====
const API_BASE = 'http://localhost:8080';
const API_USERS = `${API_BASE}/api/admin/user`;

// ===== STATE =====
let currentPage = 1;
let currentLimit = 20;
let totalUsers = 0;
let isEditMode = false;

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
        window.location.href = 'login.html';
        return false;
    }
    try {
        const data = JSON.parse(userInfo);
        const role = data.user ? data.user.role : data.role;
        if (role !== 'ADMIN') {
            window.location.href = 'login.html';
            return false;
        }
        const nameEl = document.querySelector('.admin-name');
        const avatarEl = document.querySelector('.admin-avatar');
        const uname = data.user ? data.user.username : data.username;
        if (nameEl && uname) nameEl.textContent = uname;
        if (avatarEl && uname) avatarEl.textContent = uname.charAt(0).toUpperCase();
    } catch (e) {
        window.location.href = 'login.html';
        return false;
    }
    return true;
}

function adminLogout() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('userInfo');
    window.location.href = 'login.html';
}

// ===== TOAST =====
function showToast(message, type = 'success') {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        container.style.cssText = 'position:fixed;top:20px;right:20px;z-index:9999;display:flex;flex-direction:column;gap:10px;';
        document.body.appendChild(container);
    }
    const toast = document.createElement('div');
    toast.style.cssText = `min-width:250px;padding:15px 20px;border-radius:8px;color:#fff;font-size:14px;font-family:var(--font);box-shadow:0 4px 20px rgba(0,0,0,.12);animation:slideIn .4s ease forwards;background:${type === 'error' ? 'var(--red)' : 'var(--green)'}`;
    toast.textContent = message;
    container.appendChild(toast);
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100%)';
        toast.style.transition = 'all .4s';
        setTimeout(() => toast.remove(), 400);
    }, 3000);
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

// ===== FORMAT HELPERS =====
function formatCurrency(value) {
    if (value === null || value === undefined) return '--';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
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

// ===========================
// API 1: GET /api/admin/user
// ===========================
async function loadUsers(page = 1) {
    currentPage = page;
    const role = document.getElementById('filter-role').value;
    const search = document.getElementById('search-input').value.trim();
    const sortBy = document.getElementById('filter-sort').value;

    const params = new URLSearchParams();
    if (role) params.set('role', role);
    if (search) params.set('search', search);
    params.set('sort_by', sortBy);
    params.set('page', page);
    params.set('limit', currentLimit);

    const tbody = document.getElementById('users-table-body');
    tbody.innerHTML = '<tr><td colspan="6" class="table-empty"><div class="spinner"></div> Đang tải...</td></tr>';

    try {
        const response = await fetch(`${API_USERS}?${params.toString()}`, {
            method: 'GET',
            headers: getAuthHeaders()
        });

        if (response.status === 401 || response.status === 403) {
            showToast('Phiên đăng nhập hết hạn.', 'error');
            setTimeout(() => { window.location.href = 'login.html'; }, 1500);
            return;
        }

        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        const result = await response.json();
        const users = result.data || [];
        const pagination = result.pagination || {};

        totalUsers = pagination.total || 0;
        currentPage = pagination.page || 1;
        currentLimit = pagination.limit || 20;

        renderUsersTable(users);
        renderPagination(totalUsers, currentPage, currentLimit);

    } catch (error) {
        console.error('Lỗi tải danh sách người dùng:', error);
        showToast('Không thể tải danh sách người dùng.', 'error');
        tbody.innerHTML = '<tr><td colspan="6" class="table-empty">Lỗi tải dữ liệu.</td></tr>';
    }
}

function searchUsers() {
    loadUsers(1);
}

// ===== RENDER TABLE =====
function renderUsersTable(users) {
    const tbody = document.getElementById('users-table-body');

    if (!users || users.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="table-empty">Không tìm thấy người dùng nào.</td></tr>';
        return;
    }

    tbody.innerHTML = users.map(user => {
        const roleClass = `role-${user.role || 'CUSTOMER'}`;
        return `
        <tr>
            <td style="font-weight:600;color:var(--text-muted)">#${user.user_Id || user.user_id || '--'}</td>
            <td style="font-weight:500">${user.username || '--'}</td>
            <td>${user.email || '--'}</td>
            <td>${user.phone_number || '--'}</td>
            <td><span class="role-badge ${roleClass}">${getRoleIcon(user.role)} ${getRoleName(user.role)}</span></td>
            <td>
                <div class="action-btns">
                    <button class="btn-action view" title="Xem chi tiết" onclick="viewUserDetail(${user.user_Id || user.user_id})">👁</button>
                    <button class="btn-action edit" title="Chỉnh sửa" onclick="openEditModal(${user.user_Id || user.user_id}, '${(user.username || '').replace(/'/g,"\\'")}', '${(user.email || '').replace(/'/g,"\\'")}', '${user.phone_number || ''}', '${user.role || ''}')">✏️</button>
                </div>
            </td>
        </tr>`;
    }).join('');
}

// ===== RENDER PAGINATION =====
function renderPagination(total, page, limit) {
    const info = document.getElementById('pagination-info');
    const controls = document.getElementById('pagination-controls');
    const totalPages = Math.ceil(total / limit) || 1;

    const from = (page - 1) * limit + 1;
    const to = Math.min(page * limit, total);
    info.textContent = total > 0 ? `Hiển thị ${from}–${to} / ${total} người dùng` : 'Không có dữ liệu';

    let html = '';
    // Prev
    html += `<button class="page-btn" ${page <= 1 ? 'disabled' : ''} onclick="loadUsers(${page - 1})">‹</button>`;

    // Page buttons
    const maxVisible = 5;
    let startPage = Math.max(1, page - Math.floor(maxVisible / 2));
    let endPage = Math.min(totalPages, startPage + maxVisible - 1);
    if (endPage - startPage < maxVisible - 1) startPage = Math.max(1, endPage - maxVisible + 1);

    if (startPage > 1) {
        html += `<button class="page-btn" onclick="loadUsers(1)">1</button>`;
        if (startPage > 2) html += `<span style="padding:0 4px;color:var(--text-muted)">…</span>`;
    }

    for (let i = startPage; i <= endPage; i++) {
        html += `<button class="page-btn ${i === page ? 'active' : ''}" onclick="loadUsers(${i})">${i}</button>`;
    }

    if (endPage < totalPages) {
        if (endPage < totalPages - 1) html += `<span style="padding:0 4px;color:var(--text-muted)">…</span>`;
        html += `<button class="page-btn" onclick="loadUsers(${totalPages})">${totalPages}</button>`;
    }

    // Next
    html += `<button class="page-btn" ${page >= totalPages ? 'disabled' : ''} onclick="loadUsers(${page + 1})">›</button>`;

    controls.innerHTML = html;
}

// =====================================
// API 2: GET /api/admin/user/{user_id}
// =====================================
async function viewUserDetail(userId) {
    const overlay = document.getElementById('detail-modal-overlay');
    const content = document.getElementById('detail-content');
    overlay.classList.add('open');
    content.innerHTML = '<div style="text-align:center;padding:40px;color:var(--text-muted)"><div class="spinner"></div> Đang tải...</div>';

    try {
        const response = await fetch(`${API_USERS}/${userId}`, {
            method: 'GET',
            headers: getAuthHeaders()
        });

        if (response.status === 401 || response.status === 403) {
            showToast('Phiên đăng nhập hết hạn.', 'error');
            setTimeout(() => { window.location.href = 'login.html'; }, 1500);
            return;
        }

        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        const user = await response.json();
        renderUserDetail(user);

    } catch (error) {
        console.error('Lỗi tải chi tiết người dùng:', error);
        content.innerHTML = '<div style="text-align:center;padding:40px;color:var(--red)">Không thể tải thông tin người dùng.</div>';
    }
}

function renderUserDetail(user) {
    const content = document.getElementById('detail-content');
    const roleClass = `role-${user.role || 'CUSTOMER'}`;

    let ordersHtml = '';
    if (user.order_history && user.order_history.length > 0) {
        ordersHtml = `
        <table class="order-history-table">
            <thead>
                <tr>
                    <th>Mã ĐH</th>
                    <th>Ngày đặt</th>
                    <th>Trạng thái</th>
                    <th>Tổng tiền</th>
                    <th>Giảm giá</th>
                    <th>Thanh toán</th>
                    <th>Đã trả</th>
                </tr>
            </thead>
            <tbody>
                ${user.order_history.map(order => {
                    const statusClass = `status-${order.order_status || 'PENDING'}`;
                    return `
                    <tr>
                        <td style="font-weight:600">#${order.order_id}</td>
                        <td>${formatDate(order.order_date)}</td>
                        <td><span class="status-badge ${statusClass}">${order.order_status || '--'}</span></td>
                        <td style="font-weight:500">${formatCurrency(order.total_amount)}</td>
                        <td>${formatCurrency(order.discount_amount)}</td>
                        <td>${order.payment_method || '--'}</td>
                        <td><span class="${order.is_paid ? 'paid-yes' : 'paid-no'}">${order.is_paid ? 'Đã trả' : 'Chưa trả'}</span></td>
                    </tr>`;
                }).join('')}
            </tbody>
        </table>`;
    } else {
        ordersHtml = '<div style="color:var(--text-muted);font-size:13px;padding:12px 0">Chưa có đơn hàng nào.</div>';
    }

    content.innerHTML = `
        <div class="detail-grid">
            <div class="detail-item">
                <span class="detail-label">ID</span>
                <span class="detail-value">#${user.user_id || '--'}</span>
            </div>
            <div class="detail-item">
                <span class="detail-label">Tên đăng nhập</span>
                <span class="detail-value">${user.username || '--'}</span>
            </div>
            <div class="detail-item">
                <span class="detail-label">Email</span>
                <span class="detail-value">${user.email || '--'}</span>
            </div>
            <div class="detail-item">
                <span class="detail-label">Số điện thoại</span>
                <span class="detail-value">${user.phone_number || '--'}</span>
            </div>
            <div class="detail-item">
                <span class="detail-label">Vai trò</span>
                <span class="detail-value"><span class="role-badge ${roleClass}">${getRoleIcon(user.role)} ${getRoleName(user.role)}</span></span>
            </div>
        </div>

        <hr class="detail-divider">
        <div class="detail-section-title">🧾 Lịch sử đơn hàng (${user.order_history ? user.order_history.length : 0})</div>
        ${ordersHtml}
    `;
}

function closeDetailModal() {
    document.getElementById('detail-modal-overlay').classList.remove('open');
}

// ====================================
// API 3: POST /api/admin/user (Create)
// ====================================
function openCreateModal() {
    isEditMode = false;
    document.getElementById('modal-title').textContent = 'Thêm tài khoản';
    document.getElementById('btn-submit').textContent = 'Tạo tài khoản';

    // Reset form
    document.getElementById('user-form').reset();
    document.getElementById('form-user-id').value = '';
    document.getElementById('form-username').disabled = false;
    document.getElementById('form-password').required = true;
    document.getElementById('pwd-required').style.display = '';
    document.getElementById('pwd-hint').textContent = 'Tối thiểu 6 ký tự';

    document.getElementById('user-modal-overlay').classList.add('open');
}

// ==========================================
// API 4: PATCH /api/admin/user/{id} (Update)
// ==========================================
function openEditModal(userId, username, email, phone, role) {
    isEditMode = true;
    document.getElementById('modal-title').textContent = 'Chỉnh sửa người dùng';
    document.getElementById('btn-submit').textContent = 'Lưu thay đổi';

    document.getElementById('form-user-id').value = userId;
    document.getElementById('form-username').value = username;
    document.getElementById('form-username').disabled = true; // Can't change username
    document.getElementById('form-fullname').value = ''; // Not in list response
    document.getElementById('form-email').value = email;
    document.getElementById('form-phone').value = phone;
    document.getElementById('form-role').value = role;
    document.getElementById('form-password').value = '';
    document.getElementById('form-password').required = false;
    document.getElementById('pwd-required').style.display = 'none';
    document.getElementById('pwd-hint').textContent = 'Để trống nếu không đổi mật khẩu';

    document.getElementById('user-modal-overlay').classList.add('open');
}

function closeModal() {
    document.getElementById('user-modal-overlay').classList.remove('open');
}

async function submitUserForm(event) {
    event.preventDefault();

    const userId = document.getElementById('form-user-id').value;
    const username = document.getElementById('form-username').value.trim();
    const fullName = document.getElementById('form-fullname').value.trim();
    const email = document.getElementById('form-email').value.trim();
    const phone = document.getElementById('form-phone').value.trim();
    const password = document.getElementById('form-password').value;
    const role = document.getElementById('form-role').value;

    // Validate số điện thoại: phải đúng 10 số, bắt đầu bằng 0
    const phoneRegex = /^(0|\+84)[0-9]{9}$/;
    if (phone && !phoneRegex.test(phone)) {
        showToast('Số điện thoại không hợp lệ (phải có 10 số, bắt đầu bằng 0).', 'error');
        return;
    }

    if (isEditMode) {
        // PATCH /api/admin/user/{user_id}
        const body = {};
        if (email) body.email = email;
        if (phone) body.phone_number = phone;
        if (fullName) body.full_name = fullName;
        if (role) body.role = role;
        if (password) body.password = password;

        try {
            const response = await fetch(`${API_USERS}/${userId}`, {
                method: 'PATCH',
                headers: getAuthHeaders(),
                body: JSON.stringify(body)
            });

            if (response.status === 401 || response.status === 403) {
                showToast('Phiên đăng nhập hết hạn.', 'error');
                return;
            }

            if (!response.ok) {
                const errData = await response.json().catch(() => null);
                throw new Error(errData?.message || `HTTP ${response.status}`);
            }

            showToast('Cập nhật người dùng thành công!');
            closeModal();
            loadUsers(currentPage);

        } catch (error) {
            console.error('Lỗi cập nhật:', error);
            showToast(error.message || 'Lỗi cập nhật người dùng.', 'error');
        }

    } else {
        // POST /api/admin/user
        if (!password || password.length < 6) {
            showToast('Mật khẩu phải từ 6 ký tự.', 'error');
            return;
        }

        const body = {
            username,
            full_name: fullName,
            email,
            phone_number: phone,
            password,
            role
        };

        try {
            const response = await fetch(API_USERS, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify(body)
            });

            if (response.status === 401 || response.status === 403) {
                showToast('Phiên đăng nhập hết hạn.', 'error');
                return;
            }

            if (!response.ok) {
                const errData = await response.json().catch(() => null);
                throw new Error(errData?.message || `HTTP ${response.status}`);
            }

            showToast('Tạo tài khoản thành công!');
            closeModal();
            loadUsers(1);

        } catch (error) {
            console.error('Lỗi tạo tài khoản:', error);
            showToast(error.message || 'Lỗi tạo tài khoản.', 'error');
        }
    }
}

// ===== KEYBOARD EVENTS =====
document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
        closeModal();
        closeDetailModal();
    }
});

// Search on Enter
document.addEventListener('DOMContentLoaded', function () {
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.addEventListener('keydown', function (e) {
            if (e.key === 'Enter') searchUsers();
        });
    }
});

// ===== INIT =====
document.addEventListener('DOMContentLoaded', function () {
    if (!checkAdminAuth()) return;

    // Update topbar date
    const dateEl = document.getElementById('topbar-date');
    if (dateEl) {
        const now = new Date();
        dateEl.textContent = now.toLocaleDateString('vi-VN', {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
        });
    }

    loadUsers(1);
});
