// ===== CONSTANTS =====
const API_BASE = 'http://localhost:8080';
const API_VOUCHERS_PUBLIC = `${API_BASE}/api/vouchers`;
const API_ADMIN_VOUCHERS = `${API_BASE}/api/admin/vouchers`;

// ===== STATE =====
let allVouchers = [];
let isEditMode = false;
let allProducts = [];
let totalSystemVariants = 0;
let selectedVariantIds = new Set();




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
            setTimeout(() => { window.location.href = 'login'; }, 1500);
            return;
        }

        if (!response.ok) {
            const err = await response.json().catch(() => null);
            throw new Error(err?.error?.message || err?.message || `HTTP ${response.status}`);
        }

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
        const cond = v.apply_condition;

        let applicableInfoHtml = '';
        if (cond && cond.product_variants && cond.product_variants.length > 0) {
            const isAll = cond.product_variants.length === totalSystemVariants || cond.product_variants.length === 0;
            if (isAll) {
                applicableInfoHtml = `
                <div class="voucher-info-row">
                    <span class="voucher-info-label">🎯 Áp dụng cho</span>
                    <span class="voucher-info-value" style="color: #22c55e; font-weight: 600;">Tất cả sản phẩm</span>
                </div>`;
            } else {
                const productMap = {};
                cond.product_variants.forEach(pv => {
                    const name = pv.product_name || 'Sản phẩm khác';
                    if (!productMap[name]) productMap[name] = [];
                    const cap = pv.storage_capacity ? ` - ${pv.storage_capacity}GB` : '';
                    productMap[name].push(`${pv.color || ''}${cap}`);
                });
                
                const hoverDetails = Object.entries(productMap)
                    .map(([name, vars]) => `• ${name}:\n  (${vars.join(', ')})`)
                    .join('\n');
                
                applicableInfoHtml = `
                <div class="voucher-info-row">
                    <span class="voucher-info-label">🎯 Áp dụng cho</span>
                    <span class="voucher-info-value tooltip-custom voucher-variants-badge" data-tooltip="${hoverDetails.replace(/"/g, '&quot;')}">
                        ${cond.product_variants.length} sản phẩm biến thể ℹ️
                    </span>
                </div>`;
            }
        } else {
            applicableInfoHtml = `
            <div class="voucher-info-row">
                <span class="voucher-info-label">🎯 Áp dụng cho</span>
                <span class="voucher-info-value" style="color: #22c55e; font-weight: 600;">Tất cả sản phẩm</span>
            </div>`;
        }

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
                ${applicableInfoHtml}
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
    
    // Clear variant search
    const searchInput = document.getElementById('variant-search');
    if (searchInput) searchInput.value = '';

    // Default to select all variants
    selectedVariantIds.clear();
    allProducts.forEach(p => {
        (p.variant || []).forEach(v => {
            selectedVariantIds.add(v.productVariantId);
        });
    });
    
    const selectAllCb = document.getElementById('select-all-variants');
    if (selectAllCb) selectAllCb.checked = true;

    renderVariantSelectionList();
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

    // Clear variant search
    const searchInput = document.getElementById('variant-search');
    if (searchInput) searchInput.value = '';

    try {
        const response = await fetch(`${API_ADMIN_VOUCHERS}/${voucherId}`, {
            headers: getAuthHeaders()
        });

        if (!response.ok) {
            const err = await response.json().catch(() => null);
            throw new Error(err?.error?.message || err?.message || `HTTP ${response.status}`);
        }
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

        // Handle variant checkbox restoring
        selectedVariantIds.clear();
        const appliedVariantIds = v.apply_condition ? v.apply_condition.product_variant_ids : null;
        const selectAllCb = document.getElementById('select-all-variants');

        if (!appliedVariantIds || appliedVariantIds.length === 0) {
            // Apply to all
            allProducts.forEach(p => {
                (p.variant || []).forEach(vSub => {
                    selectedVariantIds.add(vSub.productVariantId);
                });
            });
            if (selectAllCb) selectAllCb.checked = true;
        } else {
            appliedVariantIds.forEach(id => selectedVariantIds.add(id));
            if (selectAllCb) selectAllCb.checked = false;
        }

        renderVariantSelectionList();
        updateSelectAllCheckboxState();

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

    // Variant Validation
    const selectAllCb = document.getElementById('select-all-variants');
    const isAllSelected = selectAllCb ? selectAllCb.checked : true;
    const checkedVariantIds = [];

    if (!isAllSelected) {
        selectedVariantIds.forEach(id => checkedVariantIds.push(id));
        if (checkedVariantIds.length === 0) {
            showToast('Vui lòng chọn ít nhất một biến thể sản phẩm.', 'error');
            return;
        }
    }

    const body = {
        voucher_code: code,
        discount_percentage: discount,
        start_date: startDate + (startDate.includes('T') ? '' : 'T00:00:00'),
        end_date: endDate + (endDate.includes('T') ? '' : 'T23:59:59'),
        usage_limit: usageLimit
    };

    // Always create apply_condition block so backend can sync properly (with variants or all)
    body.apply_condition = {
        min_value: minValue || 0,
        product_variant_ids: isAllSelected ? [] : checkedVariantIds
    };

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
                throw new Error(err?.error?.message || err?.message || `HTTP ${response.status}`);
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
                throw new Error(err?.error?.message || err?.message || `HTTP ${response.status}`);
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
            throw new Error(err?.error?.message || err?.message || `HTTP ${response.status}`);
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

// ===== PRODUCT VARIANT TREE LOGIC & HELPERS =====
function getColorHex(colorStr) {
    if (!colorStr) return '#94a3b8';
    const name = colorStr.toLowerCase().trim();
    if (name.includes('đen') || name.includes('black')) return '#1e293b';
    if (name.includes('trắng') || name.includes('white') || name.includes('bạc') || name.includes('silver')) return '#e2e8f0';
    if (name.includes('vàng') || name.includes('gold')) return '#fbbf24';
    if (name.includes('xanh lá') || name.includes('green')) return '#22c55e';
    if (name.includes('xanh') || name.includes('blue')) return '#3b82f6';
    if (name.includes('hồng') || name.includes('pink')) return '#ec4899';
    if (name.includes('đỏ') || name.includes('red')) return '#ef4444';
    if (name.includes('tím') || name.includes('purple')) return '#a855f7';
    if (name.includes('xám') || name.includes('gray') || name.includes('grey') || name.includes('titan')) return '#64748b';
    return '#94a3b8';
}

async function loadAllProductsAndVariants() {
    try {
        const response = await fetch(`${API_BASE}/api/admin/products/all`, {
            headers: getAuthHeaders()
        });
        if (!response.ok) {
            const err = await response.json().catch(() => null);
            throw new Error(err?.error?.message || err?.message || `HTTP ${response.status}`);
        }
        allProducts = await response.json();
        
        totalSystemVariants = 0;
        allProducts.forEach(p => {
            if (p.variant) {
                totalSystemVariants += p.variant.length;
            }
        });
        
        renderVariantSelectionList();
    } catch (error) {
        console.error('Lỗi tải danh sách sản phẩm:', error);
        const listContainer = document.getElementById('variant-list');
        if (listContainer) {
            listContainer.innerHTML = '<div style="padding: 20px; text-align: center; color: var(--red);">Không thể tải danh sách sản phẩm.</div>';
        }
    }
}

function renderVariantSelectionList(filterText = '') {
    const listContainer = document.getElementById('variant-list');
    if (!listContainer) return;
    if (!allProducts || allProducts.length === 0) {
        listContainer.innerHTML = '<div style="padding: 20px; text-align: center; color: var(--text-muted);">Không có sản phẩm nào.</div>';
        return;
    }

    const filtered = allProducts.map(p => {
        const matchedVariants = (p.variant || []).filter(v => {
            const searchStr = `${p.product_name} ${v.color} ${v.storageCapacity || ''}GB`.toLowerCase();
            return searchStr.includes(filterText.toLowerCase());
        });
        return { ...p, matchedVariants };
    }).filter(p => p.matchedVariants.length > 0);

    if (filtered.length === 0) {
        listContainer.innerHTML = '<div style="padding: 20px; text-align: center; color: var(--text-muted);">Không tìm thấy sản phẩm phù hợp.</div>';
        return;
    }

    listContainer.innerHTML = filtered.map(p => {
        const variantChips = p.matchedVariants.map(v => {
            const capStr = v.storageCapacity ? ` - ${v.storageCapacity}GB` : '';
            const nameStr = `${v.color}${capStr}`;
            const colorDot = getColorHex(v.color);
            const isChecked = selectedVariantIds.has(v.productVariantId);

            return `
            <label class="variant-chip" data-variant-id="${v.productVariantId}">
                <input type="checkbox" name="product-variants" value="${v.productVariantId}" ${isChecked ? 'checked' : ''} onchange="syncProductCheckbox(${p.product_id})" data-product-id="${p.product_id}">
                <span class="chip-content">
                    <span class="chip-color-dot" style="background-color: ${colorDot};"></span>
                    <span class="chip-label">${nameStr}</span>
                </span>
            </label>`;
        }).join('');

        const allVariantsChecked = p.matchedVariants.every(v => selectedVariantIds.has(v.productVariantId));

        return `
        <div class="product-group" id="product-group-${p.product_id}" data-product-id="${p.product_id}">
            <div class="product-header">
                <label class="checkbox-container">
                    <input type="checkbox" class="product-checkbox" id="product-checkbox-${p.product_id}" ${allVariantsChecked ? 'checked' : ''} onchange="toggleProductVariants(${p.product_id})">
                    <span class="checkmark"></span>
                    <span class="product-title-text">${p.product_name}</span>
                </label>
            </div>
            <div class="variant-chips-container">
                ${variantChips}
            </div>
        </div>`;
    }).join('');
}

function toggleProductVariants(productId) {
    const productCb = document.getElementById(`product-checkbox-${productId}`);
    if (!productCb) return;
    const productGroup = document.getElementById(`product-group-${productId}`);
    if (!productGroup) return;

    const variantCbs = productGroup.querySelectorAll('input[name="product-variants"]');
    variantCbs.forEach(cb => {
        cb.checked = productCb.checked;
        const val = parseInt(cb.value);
        if (productCb.checked) {
            selectedVariantIds.add(val);
        } else {
            selectedVariantIds.delete(val);
        }
    });
    updateSelectAllCheckboxState();
}

function syncProductCheckbox(productId) {
    const productGroup = document.getElementById(`product-group-${productId}`);
    if (!productGroup) return;
    const productCb = document.getElementById(`product-checkbox-${productId}`);
    if (!productCb) return;

    const variantCbs = productGroup.querySelectorAll('input[name="product-variants"]');
    const checkedCbs = productGroup.querySelectorAll('input[name="product-variants"]:checked');

    productCb.checked = (variantCbs.length > 0 && variantCbs.length === checkedCbs.length);
    updateSelectAllCheckboxState();
}

function toggleSelectAllVariants(selectAllCb) {
    const checked = selectAllCb.checked;
    const allCbs = document.querySelectorAll('.variant-list input[type="checkbox"]');
    allCbs.forEach(cb => {
        cb.checked = checked;
    });

    if (checked) {
        allProducts.forEach(p => {
            (p.variant || []).forEach(v => {
                selectedVariantIds.add(v.productVariantId);
            });
        });
    } else {
        selectedVariantIds.clear();
    }
    
    // Refresh to update header status visually
    renderVariantSelectionList(document.getElementById('variant-search')?.value || '');
}

function updateSelectAllCheckboxState() {
    const selectAllCb = document.getElementById('select-all-variants');
    if (!selectAllCb) return;
    
    selectAllCb.checked = (totalSystemVariants > 0 && selectedVariantIds.size === totalSystemVariants);
}

function filterVariantList() {
    const keyword = document.getElementById('variant-search').value.trim();
    renderVariantSelectionList(keyword);
}

// Global listener to track individual checkbox changes and update set
document.addEventListener('change', function(e) {
    if (e.target && e.target.name === 'product-variants') {
        const val = parseInt(e.target.value);
        if (e.target.checked) {
            selectedVariantIds.add(val);
        } else {
            selectedVariantIds.delete(val);
        }
    }
});

// ===== INIT =====
document.addEventListener('DOMContentLoaded', async function () {
    if (!checkAdminAuth()) return;

    const dateEl = document.getElementById('topbar-date');
    if (dateEl) {
        const now = new Date();
        dateEl.textContent = now.toLocaleDateString('vi-VN', {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
        });
    }

    // Load products first, then load vouchers
    await loadAllProductsAndVariants();
    loadVouchers();
});
