// ===== CONSTANTS =====
const API_BASE = 'http://localhost:8080';
const API_VOUCHERS_PUBLIC = `${API_BASE}/api/vouchers`;
const API_ADMIN_VOUCHERS = `${API_BASE}/api/admin/vouchers`;

// ===== STATE =====
let allVouchers = [];
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
    if (!token || !userInfo) { window.location.href = 'login.html'; return false; }
    try {
        const data = JSON.parse(userInfo);
        const role = data.user ? data.user.role : data.role;
        if (role !== 'ADMIN') { window.location.href = 'login.html'; return false; }
        const nameEl = document.querySelector('.admin-name');
        const avatarEl = document.querySelector('.admin-avatar');
        const uname = data.user ? data.user.username : data.username;
        if (nameEl && uname) nameEl.textContent = uname;
        if (avatarEl && uname) avatarEl.textContent = uname.charAt(0).toUpperCase();
    } catch (e) { window.location.href = 'login.html'; return false; }
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

// ===== FORMAT =====
function formatCurrency(value) {
    if (value === null || value === undefined) return '--';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
}

function formatDateDisplay(dateStr) {
    if (!dateStr) return '--';
    // Handle both yyyy-MM-dd and other formats
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function getVoucherStatus(startDate, endDate) {
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (now < start) return { label: 'Sắp diễn ra', cls: 'status-upcoming', icon: '🕐' };
    if (now > end) return { label: 'Hết hạn', cls: 'status-expired', icon: '⏳' };
    return { label: 'Đang hoạt động', cls: 'status-active', icon: '✅' };
}

// ===================================
// GET /api/vouchers (list all)
// ===================================
async function loadVouchers() {
    const grid = document.getElementById('voucher-grid');
    grid.innerHTML = '<div class="loading-placeholder"><div class="spinner"></div> Đang tải...</div>';

    try {
        const response = await fetch(API_ADMIN_VOUCHERS, {
            headers: getAuthHeaders()
        });

        if (response.status === 401 || response.status === 403) {
            showToast('Phiên đăng nhập hết hạn.', 'error');
            setTimeout(() => { window.location.href = 'login.html'; }, 1500);
            return;
        }

        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        allVouchers = await response.json();
        updateStats(allVouchers);
        renderVoucherGrid(allVouchers);

    } catch (error) {
        console.error('Lỗi tải voucher:', error);
        showToast('Không thể tải danh sách voucher.', 'error');
        grid.innerHTML = '<div class="loading-placeholder">Lỗi tải dữ liệu.</div>';
    }
}

function filterVouchers() {
    const keyword = document.getElementById('search-input').value.trim().toLowerCase();
    if (!keyword) {
        renderVoucherGrid(allVouchers);
        return;
    }
    const filtered = allVouchers.filter(v =>
        (v.voucher_code || '').toLowerCase().includes(keyword)
    );
    renderVoucherGrid(filtered);
}

// ===== STATS =====
function updateStats(vouchers) {
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    let active = 0, expired = 0;
    vouchers.forEach(v => {
        const end = new Date(v.end_date);
        const start = new Date(v.start_date);
        if (now > end) expired++;
        else if (now >= start) active++;
    });

    document.getElementById('stat-total').textContent = vouchers.length;
    document.getElementById('stat-active').textContent = active;
    document.getElementById('stat-expired').textContent = expired;
}

// ===== RENDER GRID =====
function renderVoucherGrid(vouchers) {
    const grid = document.getElementById('voucher-grid');

    if (!vouchers || vouchers.length === 0) {
        grid.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">🎫</div>
                <div class="empty-state-text">Không tìm thấy voucher nào.</div>
            </div>`;
        return;
    }

    grid.innerHTML = vouchers.map(v => {
        const status = getVoucherStatus(v.start_date, v.end_date);
        const minValue = v.apply_condition ? v.apply_condition.min_value : null;

        return `
        <div class="voucher-card">
            <div class="voucher-card-top">
                <div class="voucher-code">${v.voucher_code || '--'}</div>
                <div class="voucher-discount">${v.discount_percentage || 0}<span class="voucher-discount-suffix">% OFF</span></div>
            </div>
            <div class="voucher-card-body">
                <div class="voucher-info-row">
                    <span class="voucher-info-label">📅 Bắt đầu</span>
                    <span class="voucher-info-value">${formatDateDisplay(v.start_date)}</span>
                </div>
                <div class="voucher-info-row">
                    <span class="voucher-info-label">📅 Kết thúc</span>
                    <span class="voucher-info-value">${formatDateDisplay(v.end_date)}</span>
                </div>
                <hr class="voucher-divider">
                <div class="voucher-info-row">
                    <span class="voucher-info-label">🎯 Giới hạn</span>
                    <span class="voucher-info-value">${v.usage_limit != null ? v.usage_limit + ' lượt' : 'Không giới hạn'}</span>
                </div>
                ${minValue ? `
                <div class="voucher-info-row">
                    <span class="voucher-info-label">💰 Đơn tối thiểu</span>
                    <span class="voucher-info-value">${formatCurrency(minValue)}</span>
                </div>` : ''}
            </div>
            <div class="voucher-card-footer">
                <span class="voucher-status ${status.cls}">${status.icon} ${status.label}</span>
                <div style="display:flex;gap:6px">
                    ${status.cls === 'status-expired' ? `<button class="btn-edit-voucher" onclick="openExtendModal(${v.voucher_id})" style="border-color:var(--green);color:var(--green)">⏳ Gia hạn</button>` : ''}
                    <button class="btn-edit-voucher" onclick="openEditModal(${v.voucher_id})">✏️ Sửa</button>
                </div>
            </div>
        </div>`;
    }).join('');
}

// ==========================================
// POST /api/admin/vouchers (Create voucher)
// ==========================================
function openCreateModal() {
    isEditMode = false;
    document.getElementById('modal-title').textContent = 'Tạo voucher mới';
    document.getElementById('btn-submit').textContent = 'Tạo voucher';
    document.getElementById('voucher-form').reset();
    document.getElementById('form-voucher-id').value = '';
    document.getElementById('form-code').disabled = false;
    document.getElementById('create-modal-overlay').classList.add('open');
}

function closeCreateModal() {
    document.getElementById('create-modal-overlay').classList.remove('open');
}

// ==================================================
// PATCH /api/admin/vouchers/{voucher_id} (Update)
// ==================================================
async function openEditModal(voucherId) {
    isEditMode = true;
    document.getElementById('modal-title').textContent = 'Chỉnh sửa voucher';
    document.getElementById('btn-submit').textContent = 'Lưu thay đổi';

    try {
        const response = await fetch(`${API_ADMIN_VOUCHERS}/${voucherId}`, {
            headers: getAuthHeaders()
        });

        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const v = await response.json();

        document.getElementById('form-voucher-id').value = v.voucher_id;
        document.getElementById('form-code').value = v.voucher_code || '';
        document.getElementById('form-code').disabled = false;
        document.getElementById('form-discount').value = v.discount_percentage || '';
        document.getElementById('form-usage').value = v.usage_limit || '';
        document.getElementById('form-min-value').value = v.apply_condition ? v.apply_condition.min_value : '';

        if (v.start_date) {
            document.getElementById('form-start').value = v.start_date.split('T')[0];
        }
        if (v.end_date) {
            document.getElementById('form-end').value = v.end_date.split('T')[0];
        }

        document.getElementById('create-modal-overlay').classList.add('open');
    } catch (error) {
        console.error('Lỗi tải chi tiết:', error);
        showToast('Không thể tải thông tin voucher.', 'error');
    }
}

async function submitVoucherForm(event) {
    event.preventDefault();

    const voucherId = document.getElementById('form-voucher-id').value;
    const code = document.getElementById('form-code').value.trim();
    const discount = parseFloat(document.getElementById('form-discount').value);
    const startDate = document.getElementById('form-start').value;
    const endDate = document.getElementById('form-end').value;
    const usageLimit = parseInt(document.getElementById('form-usage').value);
    const minValue = document.getElementById('form-min-value').value ? parseFloat(document.getElementById('form-min-value').value) : null;

    // Validation
    if (!code) { showToast('Vui lòng nhập mã voucher.', 'error'); return; }
    if (!discount || discount <= 0 || discount > 100) { showToast('Phần trăm giảm giá phải từ 1-100.', 'error'); return; }
    if (!startDate || !endDate) { showToast('Vui lòng chọn ngày bắt đầu và kết thúc.', 'error'); return; }
    if (new Date(startDate) > new Date(endDate)) { showToast('Ngày bắt đầu phải trước ngày kết thúc.', 'error'); return; }
    if (!usageLimit || usageLimit <= 0) { showToast('Giới hạn lượt dùng phải lớn hơn 0.', 'error'); return; }

    const body = {
        voucher_code: code,
        discount_percentage: discount,
        start_date: startDate,
        end_date: endDate,
        usage_limit: usageLimit
    };

    if (minValue !== null && minValue > 0) {
        body.apply_condition = { min_value: minValue };
    }

    if (isEditMode) {
        // PATCH
        try {
            const response = await fetch(`${API_ADMIN_VOUCHERS}/${voucherId}`, {
                method: 'PATCH',
                headers: getAuthHeaders(),
                body: JSON.stringify(body)
            });

            if (response.status === 401 || response.status === 403) {
                showToast('Phiên đăng nhập hết hạn.', 'error');
                return;
            }
            if (!response.ok) {
                const err = await response.json().catch(() => null);
                throw new Error(err?.message || `HTTP ${response.status}`);
            }

            showToast('Cập nhật voucher thành công!');
            closeCreateModal();
            loadVouchers();

        } catch (error) {
            console.error('Lỗi cập nhật voucher:', error);
            showToast(error.message || 'Lỗi cập nhật voucher.', 'error');
        }

    } else {
        // POST
        try {
            const response = await fetch(API_ADMIN_VOUCHERS, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify(body)
            });

            if (response.status === 401 || response.status === 403) {
                showToast('Phiên đăng nhập hết hạn.', 'error');
                return;
            }
            if (!response.ok) {
                const err = await response.json().catch(() => null);
                throw new Error(err?.message || `HTTP ${response.status}`);
            }

            showToast('Tạo voucher thành công!');
            closeCreateModal();
            loadVouchers();

        } catch (error) {
            console.error('Lỗi tạo voucher:', error);
            showToast(error.message || 'Lỗi tạo voucher.', 'error');
        }
    }
}

// ==========================================
// POST /api/admin/vouchers/{id}/extends
// ==========================================
function openExtendModal(voucherId) {
    document.getElementById('extend-voucher-id').value = voucherId;
    document.getElementById('extend-new-end-date').value = '';
    document.getElementById('extend-modal-overlay').classList.add('open');
}

function closeExtendModal() {
    document.getElementById('extend-modal-overlay').classList.remove('open');
}

async function submitExtendForm(event) {
    event.preventDefault();
    const voucherId = document.getElementById('extend-voucher-id').value;
    const newEndDate = document.getElementById('extend-new-end-date').value;

    if (!newEndDate) { showToast('Vui lòng chọn ngày mới.', 'error'); return; }

    try {
        const response = await fetch(`${API_ADMIN_VOUCHERS}/${voucherId}/extends`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({ new_end_date: newEndDate + 'T23:59:59' }) // append time since it's a date input and backend expects LocalDateTime
        });
        
        if (!response.ok) {
            const err = await response.json().catch(() => null);
            throw new Error(err?.message || 'Lỗi gia hạn');
        }
        
        showToast('Gia hạn thành công!');
        closeExtendModal();
        loadVouchers();
    } catch (e) {
        showToast(e.message, 'error');
    }
}

// ===== KEYBOARD =====
document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
        closeCreateModal();
        closeExtendModal();
    }
});

document.addEventListener('DOMContentLoaded', function () {
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.addEventListener('keydown', function (e) {
            if (e.key === 'Enter') filterVouchers();
        });
    }
});

// ===== INIT =====
document.addEventListener('DOMContentLoaded', function () {
    if (!checkAdminAuth()) return;

    const dateEl = document.getElementById('topbar-date');
    if (dateEl) {
        const now = new Date();
        dateEl.textContent = now.toLocaleDateString('vi-VN', {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
        });
    }

    loadVouchers();
});
