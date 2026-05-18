// ===== CONSTANTS =====
const API_BASE = 'http://localhost:8080';
const API_ADMIN_DEVICES = `${API_BASE}/api/admin/devices`;
const API_PRODUCTS_PUBLIC = `${API_BASE}/api/products`;

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

function formatDate(dateStr) {
    if (!dateStr) return '--';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('vi-VN') + ' ' + d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
}

function getStatusBadge(status) {
    if (!status) return '<span class="device-status">--</span>';
    if (status.toUpperCase() === 'INSTOCK') return '<span class="device-status status-instock">Trong kho</span>';
    if (status.toUpperCase() === 'SOLD') return '<span class="device-status status-sold">Đã bán</span>';
    if (status.toUpperCase() === 'DEFECTIVE') return '<span class="device-status status-defective">Lỗi/Hỏng</span>';
    return `<span class="device-status">${status}</span>`;
}

// ===================================
// GET /api/admin/devices/{imei}
// ===================================
async function searchDevice(event) {
    event.preventDefault();
    const imei = document.getElementById('search-imei').value.trim();
    if (!imei) return;

    const container = document.getElementById('search-result-container');
    const detail = document.getElementById('device-detail');
    const emptyState = document.getElementById('empty-state');

    emptyState.style.display = 'none';
    container.style.display = 'block';
    detail.innerHTML = '<div style="text-align:center;padding:40px;color:var(--text-muted)"><div class="spinner"></div> Đang tra cứu...</div>';

    try {
        const response = await fetch(`${API_ADMIN_DEVICES}/${imei}`, {
            headers: getAuthHeaders()
        });

        if (response.status === 401 || response.status === 403) {
            showToast('Phiên đăng nhập hết hạn.', 'error');
            setTimeout(() => window.location.href = 'login.html', 1500);
            return;
        }

        if (!response.ok) {
            const err = await response.json().catch(() => null);
            throw new Error(err?.message || `HTTP ${response.status}`);
        }

        const data = await response.json();
        renderDeviceDetail(data);

    } catch (error) {
        console.error('Lỗi tra cứu IMEI:', error);
        detail.innerHTML = `
            <div style="text-align:center;padding:40px;color:var(--red);">
                <div style="font-size:32px;margin-bottom:10px;">❌</div>
                <div>Không tìm thấy thiết bị với IMEI <strong>${imei}</strong></div>
                <div style="font-size:13px;color:var(--text-muted);margin-top:8px;">${error.message}</div>
            </div>`;
    }
}

function renderDeviceDetail(device) {
    const detail = document.getElementById('device-detail');
    
    let warrantyHtml = '<div class="info-group-title" style="margin-top: 16px;">Thông tin bảo hành</div><div style="font-size:13px;color:var(--text-muted);">Chưa có thông tin bảo hành.</div>';
    if (device.warratyInfo) {
        warrantyHtml = `
            <div class="info-group-title" style="margin-top: 16px;">Thông tin bảo hành</div>
            <div class="info-row">
                <span class="info-label">Ngày bắt đầu</span>
                <span class="info-value">${formatDate(device.warratyInfo.startDate)}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Ngày kết thúc</span>
                <span class="info-value">${formatDate(device.warratyInfo.endDate)}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Trạng thái</span>
                <span class="info-value">${device.warratyInfo.status || '--'}</span>
            </div>
        `;
    }

    detail.innerHTML = `
        <div class="device-header">
            <div class="device-title">
                <span>📱 ${device.productName || 'Thiết bị không xác định'}</span>
                <span class="device-imei-badge">IMEI: ${device.imei}</span>
            </div>
            ${getStatusBadge(device.status)}
        </div>
        
        <div class="device-info-grid">
            <div class="info-group">
                <div class="info-group-title">Thông tin cơ bản</div>
                <div class="info-row">
                    <span class="info-label">Device ID</span>
                    <span class="info-value">#${device.deviceId || '--'}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Màu sắc</span>
                    <span class="info-value">${device.color || '--'}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Variant ID</span>
                    <span class="info-value">#${device.productVariantId || '--'}</span>
                </div>
            </div>
            
            <div class="info-group">
                ${warrantyHtml}
            </div>
        </div>
    `;
}

// ===================================
// IMPORT DEVICES (Nhập kho)
// ===================================
async function openImportModal() {
    document.getElementById('import-form').reset();
    document.getElementById('select-variant').innerHTML = '<option value="">-- Chọn biến thể --</option>';
    document.getElementById('select-variant').disabled = true;
    document.getElementById('import-modal-overlay').classList.add('open');
    
    // Load products if not loaded
    const select = document.getElementById('select-product');
    if (select.options.length <= 1) {
        try {
            const response = await fetch(`${API_PRODUCTS_PUBLIC}?limit=100`);
            if (response.ok) {
                const res = await response.json();
                const products = res.data || [];
                products.forEach(p => {
                    const opt = document.createElement('option');
                    opt.value = p.product_id;
                    opt.textContent = `${p.product_name} (${p.brand})`;
                    select.appendChild(opt);
                });
            }
        } catch (e) { console.error('Lỗi tải sản phẩm', e); }
    }
}

function closeImportModal() {
    document.getElementById('import-modal-overlay').classList.remove('open');
}

async function onProductChange() {
    const productId = document.getElementById('select-product').value;
    const variantSelect = document.getElementById('select-variant');
    
    variantSelect.innerHTML = '<option value="">-- Đang tải... --</option>';
    variantSelect.disabled = true;

    if (!productId) {
        variantSelect.innerHTML = '<option value="">-- Chọn biến thể --</option>';
        return;
    }

    try {
        const response = await fetch(`${API_PRODUCTS_PUBLIC}/${productId}`);
        if (!response.ok) throw new Error('Failed to load variants');
        const product = await response.json();
        
        variantSelect.innerHTML = '<option value="">-- Chọn biến thể --</option>';
        const variants = product.variant || [];
        
        variants.forEach(v => {
            const opt = document.createElement('option');
            opt.value = v.productVariantId;
            const specs = [v.color, v.storageCapacity ? v.storageCapacity + 'GB' : null, v.ram].filter(Boolean).join(' - ');
            opt.textContent = `[ID: ${v.productVariantId}] ${specs}`;
            variantSelect.appendChild(opt);
        });
        
        variantSelect.disabled = false;
    } catch (error) {
        console.error('Lỗi tải biến thể:', error);
        variantSelect.innerHTML = '<option value="">Lỗi tải dữ liệu</option>';
    }
}

async function submitImportForm(event) {
    event.preventDefault();
    const variantId = document.getElementById('select-variant').value;
    const imeiText = document.getElementById('input-imeis').value;

    if (!variantId) {
        showToast('Vui lòng chọn biến thể.', 'error');
        return;
    }

    // Process IMEIs (split by newline, remove empty, trim)
    const imeiList = imeiText.split('\n').map(i => i.trim()).filter(i => i.length > 0);
    
    if (imeiList.length === 0) {
        showToast('Vui lòng nhập ít nhất 1 IMEI.', 'error');
        return;
    }

    const btn = document.getElementById('btn-submit-import');
    btn.disabled = true;
    btn.textContent = 'Đang xử lý...';

    try {
        const response = await fetch(`${API_ADMIN_DEVICES}/import`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({
                product_variant_id: parseInt(variantId),
                imei_list: imeiList
            })
        });

        if (response.status === 401 || response.status === 403) {
            showToast('Phiên đăng nhập hết hạn.', 'error');
            return;
        }

        if (!response.ok) {
            const err = await response.json().catch(() => null);
            throw new Error(err?.message || `Lỗi server HTTP ${response.status}`);
        }

        const resData = await response.json();
        closeImportModal();
        showImportResult(resData);
        
    } catch (error) {
        console.error('Lỗi nhập kho:', error);
        showToast(error.message || 'Lỗi nhập kho.', 'error');
    } finally {
        btn.disabled = false;
        btn.textContent = 'Nhập kho';
    }
}

// ===== IMPORT RESULT MODAL =====
function showImportResult(data) {
    document.getElementById('result-imported-count').textContent = data.imported || 0;
    
    const tbody = document.getElementById('result-devices-list');
    const devices = data.devices || [];
    
    tbody.innerHTML = devices.map(d => `
        <tr>
            <td>#${d.devices_id || '--'}</td>
            <td style="font-family: monospace;">${d.imei}</td>
            <td style="text-align: center;">${getStatusBadge(d.status)}</td>
        </tr>
    `).join('');
    
    document.getElementById('import-result-overlay').classList.add('open');
}

function closeImportResultModal() {
    document.getElementById('import-result-overlay').classList.remove('open');
}

// ===== INIT =====
document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
        closeImportModal();
        closeImportResultModal();
    }
});

document.addEventListener('DOMContentLoaded', function () {
    if (!checkAdminAuth()) return;

    const dateEl = document.getElementById('topbar-date');
    if (dateEl) {
        const now = new Date();
        dateEl.textContent = now.toLocaleDateString('vi-VN', {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
        });
    }
});
