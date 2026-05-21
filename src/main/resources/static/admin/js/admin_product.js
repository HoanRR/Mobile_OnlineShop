// ===== CONSTANTS =====
const API_BASE = 'http://localhost:8080';
const API_PRODUCTS_PUBLIC = `${API_BASE}/api/products`;
const API_ADMIN_PRODUCTS = `${API_BASE}/api/admin/products`;

// ===== STATE =====
let currentPage = 1;
let currentLimit = 10;
let currentProductDetail = null;


// ========================================
// GET /api/products (public, for listing)
// ========================================
async function loadProducts(page = 1) {
    currentPage = page;
    const keyword = document.getElementById('search-input').value.trim();
    const brand = document.getElementById('filter-brand').value;
    const sortBy = document.getElementById('filter-sort').value;
    const order = document.getElementById('filter-order').value;

    const params = new URLSearchParams();
    params.set('page', page);
    params.set('limit', currentLimit);
    if (keyword) params.set('keyword', keyword);
    if (brand) params.set('brand', brand);
    params.set('sortBy', sortBy);
    params.set('order', order);

    const tbody = document.getElementById('products-table-body');
    tbody.innerHTML = '<tr><td colspan="7" class="table-empty"><div class="spinner"></div> Đang tải...</td></tr>';

    try {
        const response = await fetch(`${API_PRODUCTS_PUBLIC}?${params.toString()}`);
        if (!response.ok) {
            const err = await response.json().catch(() => null);
            throw new Error(err?.error?.message || err?.message || `HTTP ${response.status}`);
        }

        const result = await response.json();
        const products = result.data || [];
        const pagination = result.pagination || {};

        renderProductsTable(products);
        renderPagination(pagination.total || 0, pagination.page || 1, pagination.limit || currentLimit);

    } catch (error) {
        console.error('Lỗi tải sản phẩm:', error);
        showToast('Không thể tải danh sách sản phẩm.', 'error');
        tbody.innerHTML = '<tr><td colspan="7" class="table-empty">Lỗi tải dữ liệu.</td></tr>';
    }
}

function searchProducts() { loadProducts(1); }

// ===== RENDER TABLE =====
function renderProductsTable(products) {
    const tbody = document.getElementById('products-table-body');

    if (!products || products.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="table-empty">Không tìm thấy sản phẩm nào.</td></tr>';
        return;
    }

    tbody.innerHTML = products.map(p => {
        const imgHtml = p.product_image_link
            ? `<img src="${p.product_image_link}" alt="${p.product_name}" class="product-thumb">`
            : '<div class="product-thumb-placeholder">📱</div>';

        return `
        <tr>
            <td style="font-weight:600;color:var(--text-muted)">#${p.product_id}</td>
            <td>${imgHtml}</td>
            <td style="font-weight:500">${p.product_name || '--'}</td>
            <td><span class="brand-badge">${p.brand || '--'}</span></td>
            <td style="font-weight:600;color:var(--accent)">${formatCurrency(p.min_price)}</td>
            <td>${renderStars(p.avg_rating)}</td>
            <td>
                <div class="action-btns">
                    <button class="btn-action view" title="Xem chi tiết" onclick="viewProductDetail(${p.product_id})">👁</button>
                    <button class="btn-action edit" title="Chỉnh sửa" onclick="openEditProductModal(${p.product_id}, '${(p.product_name||'').replace(/'/g,"\\'")}', '${p.brand||''}', '${(p.description||'').replace(/'/g,"\\'")}', '${p.product_image_link||''}')">✏️</button>
                    <button class="btn-action delete" title="Xóa" onclick="openDeleteModal(${p.product_id}, '${(p.product_name||'').replace(/'/g,"\\'")}')">🗑</button>
                </div>
            </td>
        </tr>`;
    }).join('');
}

// ===== PAGINATION =====
function renderPagination(total, page, limit) {
    const info = document.getElementById('pagination-info');
    const controls = document.getElementById('pagination-controls');
    const totalPages = Math.ceil(total / limit) || 1;

    const from = (page - 1) * limit + 1;
    const to = Math.min(page * limit, total);
    info.textContent = total > 0 ? `Hiển thị ${from}–${to} / ${total} sản phẩm` : 'Không có dữ liệu';

    let html = `<button class="page-btn" ${page <= 1 ? 'disabled' : ''} onclick="loadProducts(${page - 1})">‹</button>`;

    const maxVisible = 5;
    let startPage = Math.max(1, page - Math.floor(maxVisible / 2));
    let endPage = Math.min(totalPages, startPage + maxVisible - 1);
    if (endPage - startPage < maxVisible - 1) startPage = Math.max(1, endPage - maxVisible + 1);

    if (startPage > 1) {
        html += `<button class="page-btn" onclick="loadProducts(1)">1</button>`;
        if (startPage > 2) html += '<span style="padding:0 4px;color:var(--text-muted)">…</span>';
    }
    for (let i = startPage; i <= endPage; i++) {
        html += `<button class="page-btn ${i === page ? 'active' : ''}" onclick="loadProducts(${i})">${i}</button>`;
    }
    if (endPage < totalPages) {
        if (endPage < totalPages - 1) html += '<span style="padding:0 4px;color:var(--text-muted)">…</span>';
        html += `<button class="page-btn" onclick="loadProducts(${totalPages})">${totalPages}</button>`;
    }

    html += `<button class="page-btn" ${page >= totalPages ? 'disabled' : ''} onclick="loadProducts(${page + 1})">›</button>`;
    controls.innerHTML = html;
}

// =============================================
// GET /api/products/{product_id} (Detail view)
// =============================================
async function viewProductDetail(productId) {
    const overlay = document.getElementById('detail-modal-overlay');
    const content = document.getElementById('detail-content');
    overlay.classList.add('open');
    content.innerHTML = '<div style="text-align:center;padding:40px;color:var(--text-muted)"><div class="spinner"></div> Đang tải...</div>';

    try {
        const response = await fetch(`${API_PRODUCTS_PUBLIC}/${productId}`, {
            headers: getAuthHeaders()
        });
        if (!response.ok) {
            const err = await response.json().catch(() => null);
            throw new Error(err?.error?.message || err?.message || `HTTP ${response.status}`);
        }

        const product = await response.json();
        currentProductDetail = product; // Store in global state
        renderProductDetail(product);

    } catch (error) {
        console.error('Lỗi tải chi tiết:', error);
        content.innerHTML = '<div style="text-align:center;padding:40px;color:var(--red)">Không thể tải thông tin sản phẩm.</div>';
    }
}

function renderProductDetail(product) {
    const content = document.getElementById('detail-content');
    const variants = product.variant || [];

    const imgHtml = product.product_image_link
        ? `<img src="${product.product_image_link}" alt="${product.product_name}" class="detail-product-img">`
        : '<div class="product-thumb-placeholder" style="width:120px;height:120px;font-size:40px">📱</div>';

    let variantsHtml = '';
    if (variants.length > 0) {
        variantsHtml = '<div class="variants-grid">' + variants.map(v => {
            const variantJson = JSON.stringify(v).replace(/"/g, '&quot;');
            return `
            <div class="variant-card">
                <div class="variant-card-header">
                    <div>
                        <span style="font-weight:600">${v.color || '--'}</span>
                        <span style="color:var(--text-muted);font-size:12px;margin-left:4px">${v.storageCapacity ? v.storageCapacity + 'GB' : ''}</span>
                    </div>
                    <div style="display:flex;align-items:center;gap:8px;">
                        <span class="variant-price">${formatCurrency(v.price)}</span>
                        <div class="variant-actions-inline">
                            <button class="btn-var-action edit" title="Sửa biến thể" onclick="openEditVariantModal(${v.productVariantId})">✏️</button>
                            <button class="btn-var-action delete" title="Xóa biến thể" onclick="openDeleteVariantModal(${v.productVariantId}, '${(v.color || '').replace(/'/g, "\\'")}', '${v.storageCapacity || ''}')">🗑</button>
                        </div>
                    </div>
                </div>
                <div class="variant-specs">
                    <div class="variant-spec-item"><span class="variant-spec-label">Chip:</span><span class="variant-spec-value">${v.chip || '--'}</span></div>
                    <div class="variant-spec-item"><span class="variant-spec-label">RAM:</span><span class="variant-spec-value">${v.ram || '--'}</span></div>
                    <div class="variant-spec-item"><span class="variant-spec-label">Pin:</span><span class="variant-spec-value">${v.batteryCapacity ? v.batteryCapacity + 'mAh' : '--'}</span></div>
                    <div class="variant-spec-item"><span class="variant-spec-label">Màn hình:</span><span class="variant-spec-value">${v.screenSize || '--'}</span></div>
                    <div class="variant-spec-item"><span class="variant-spec-label">Camera trước:</span><span class="variant-spec-value">${v.frontCamera || '--'}</span></div>
                    <div class="variant-spec-item"><span class="variant-spec-label">Camera sau:</span><span class="variant-spec-value">${v.rearCamera || '--'}</span></div>
                    <div class="variant-spec-item"><span class="variant-spec-label">Độ p/giải:</span><span class="variant-spec-value">${v.resolution || '--'}</span></div>
                    <div class="variant-spec-item"><span class="variant-spec-label">SIM:</span><span class="variant-spec-value">${v.simCard || '--'}</span></div>
                </div>
                <div class="variant-stock">
                    Kho: <span class="${v.totalAvailable > 0 ? 'stock-available' : 'stock-out'}">${v.totalAvailable != null ? v.totalAvailable : '--'} ${v.totalAvailable > 0 ? 'có sẵn' : 'hết hàng'}</span>
                </div>
            </div>
            `;
        }).join('') + '</div>';
    } else {
        variantsHtml = '<div style="color:var(--text-muted);font-size:13px">Chưa có biến thể nào.</div>';
    }

    content.innerHTML = `
        <div class="detail-product-header">
            ${imgHtml}
            <div class="detail-product-info">
                <div class="detail-product-name">${product.product_name || '--'}</div>
                <div class="detail-product-brand"><span class="brand-badge">${product.brand || '--'}</span></div>
                <div class="detail-product-desc">${product.description || 'Chưa có mô tả.'}</div>
            </div>
        </div>
        <hr class="detail-divider">
        <div class="detail-section-title-container">
            <div class="detail-section-title" style="margin-bottom:0">🎨 Biến thể (${variants.length})</div>
            <button class="btn-add-variant-inline" onclick="openAddVariantModal(${product.product_id}, '${(product.product_name || '').replace(/'/g, "\\'")}')">➕ Thêm biến thể mới</button>
        </div>
        ${variantsHtml}
    `;
}

function closeDetailModal() {
    document.getElementById('detail-modal-overlay').classList.remove('open');
    currentProductDetail = null;
}

// =======================================
// POST /api/admin/products (Add product)
// =======================================
let variantCounter = 0;

function openAddProductModal() {
    document.getElementById('add-product-form').reset();
    document.getElementById('variants-container').innerHTML = '';
    variantCounter = 0;
    addVariantRow(); // Start with 1 variant
    document.getElementById('add-modal-overlay').classList.add('open');
}

function closeAddModal() {
    document.getElementById('add-modal-overlay').classList.remove('open');
}

function addVariantRow() {
    variantCounter++;
    const container = document.getElementById('variants-container');
    const html = `
    <div class="variant-row" id="variant-row-${variantCounter}">
        <div class="variant-row-header">
            <span class="variant-row-title">Biến thể #${variantCounter}</span>
            <button type="button" class="btn-remove-variant" onclick="removeVariantRow(${variantCounter})">✕</button>
        </div>
        <div class="variant-fields">
            <div class="form-group">
                <label>Màu sắc</label>
                <input type="text" class="v-color" placeholder="Đen, Trắng...">
            </div>
            <div class="form-group">
                <label>Bộ nhớ (GB)</label>
                <input type="number" class="v-storage" placeholder="128">
            </div>
            <div class="form-group">
                <label>Pin (mAh)</label>
                <input type="number" class="v-battery" placeholder="4500">
            </div>
            <div class="form-group">
                <label>Giá (VNĐ) *</label>
                <input type="number" class="v-price" placeholder="10000000" required>
            </div>
            <div class="form-group">
                <label>Chip</label>
                <input type="text" class="v-chip" placeholder="Snapdragon 8 Gen 3">
            </div>
            <div class="form-group">
                <label>RAM</label>
                <input type="text" class="v-ram" placeholder="8GB">
            </div>
            <div class="form-group">
                <label>Độ phân giải</label>
                <input type="text" class="v-resolution" placeholder="2796x1290">
            </div>
            <div class="form-group">
                <label>Màn hình</label>
                <input type="text" class="v-screen" placeholder="6.7 inch">
            </div>
            <div class="form-group">
                <label>Camera trước</label>
                <input type="text" class="v-front-cam" placeholder="12MP">
            </div>
            <div class="form-group">
                <label>Camera sau</label>
                <input type="text" class="v-rear-cam" placeholder="48MP+12MP">
            </div>
            <div class="form-group">
                <label>SIM</label>
                <input type="text" class="v-sim" placeholder="2 Nano SIM">
            </div>
        </div>
    </div>`;
    container.insertAdjacentHTML('beforeend', html);
}

function removeVariantRow(id) {
    const row = document.getElementById(`variant-row-${id}`);
    if (row) row.remove();
}

async function submitAddProduct(event) {
    event.preventDefault();

    const name = document.getElementById('add-name').value.trim();
    const brand = document.getElementById('add-brand').value;
    const description = document.getElementById('add-desc').value.trim();
    const imageLink = document.getElementById('add-image').value.trim();

    if (!name) {
        showToast('Vui lòng nhập tên sản phẩm.', 'error');
        return;
    }

    // Collect variants
    const variantRows = document.querySelectorAll('.variant-row');
    const variants = [];
    for (const row of variantRows) {
        const price = row.querySelector('.v-price').value;
        if (!price) {
            showToast('Vui lòng nhập giá cho tất cả biến thể.', 'error');
            return;
        }
        variants.push({
            color: row.querySelector('.v-color').value.trim() || null,
            storage_capacity: row.querySelector('.v-storage').value ? Number(row.querySelector('.v-storage').value) : null,
            battery_capacity: row.querySelector('.v-battery').value ? Number(row.querySelector('.v-battery').value) : null,
            price: Number(price),
            chip: row.querySelector('.v-chip').value.trim() || null,
            ram: row.querySelector('.v-ram').value.trim() || null,
            resolution: row.querySelector('.v-resolution').value.trim() || null,
            screen_size: row.querySelector('.v-screen').value.trim() || null,
            front_camera: row.querySelector('.v-front-cam').value.trim() || null,
            rear_camera: row.querySelector('.v-rear-cam').value.trim() || null,
            sim_card: row.querySelector('.v-sim').value.trim() || null,
            total_available: 0,
            variant_image_link: null
        });
    }

    const body = {
        product_name: name,
        brand: brand || null,
        description: description || null,
        product_image_link: imageLink || null,
        variants: variants
    };

    try {
        const response = await fetch(API_ADMIN_PRODUCTS, {
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

        showToast('Tạo sản phẩm thành công!');
        closeAddModal();
        loadProducts(1);

    } catch (error) {
        console.error('Lỗi tạo sản phẩm:', error);
        showToast(error.message || 'Lỗi tạo sản phẩm.', 'error');
    }
}

// ================================================
// PATCH /api/admin/products/{product_id} (Update)
// ================================================
function openEditProductModal(productId, name, brand, description, imageLink) {
    document.getElementById('edit-product-id').value = productId;
    document.getElementById('edit-name').value = name;
    document.getElementById('edit-brand').value = brand;
    document.getElementById('edit-desc').value = description;
    document.getElementById('edit-image').value = imageLink;
    document.getElementById('edit-modal-overlay').classList.add('open');
}

function closeEditModal() {
    document.getElementById('edit-modal-overlay').classList.remove('open');
}

async function submitEditProduct(event) {
    event.preventDefault();

    const productId = document.getElementById('edit-product-id').value;
    const name = document.getElementById('edit-name').value.trim();
    const brand = document.getElementById('edit-brand').value;
    const description = document.getElementById('edit-desc').value.trim();
    const imageLink = document.getElementById('edit-image').value.trim();

    const body = {};
    if (name) body.product_name = name;
    if (brand) body.brand = brand;
    if (description) body.description = description;
    if (imageLink) body.product_image_link = imageLink;

    try {
        const response = await fetch(`${API_ADMIN_PRODUCTS}/${productId}`, {
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

        showToast('Cập nhật sản phẩm thành công!');
        closeEditModal();
        loadProducts(currentPage);

    } catch (error) {
        console.error('Lỗi cập nhật:', error);
        showToast(error.message || 'Lỗi cập nhật sản phẩm.', 'error');
    }
}

// ================================================
// DELETE /api/admin/products/{product_id} (Delete)
// ================================================
function openDeleteModal(productId, productName) {
    document.getElementById('delete-product-id').value = productId;
    document.getElementById('delete-product-name').textContent = productName;
    document.getElementById('delete-modal-overlay').classList.add('open');
}

function closeDeleteModal() {
    document.getElementById('delete-modal-overlay').classList.remove('open');
}

async function confirmDelete() {
    const productId = document.getElementById('delete-product-id').value;

    try {
        const response = await fetch(`${API_ADMIN_PRODUCTS}/${productId}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });

        if (response.status === 401 || response.status === 403) {
            showToast('Phiên đăng nhập hết hạn.', 'error');
            return;
        }
        if (!response.ok) {
            const err = await response.json().catch(() => null);
            throw new Error(err?.error?.message || err?.message || `HTTP ${response.status}`);
        }

        showToast('Xóa sản phẩm thành công!');
        closeDeleteModal();
        loadProducts(currentPage);

    } catch (error) {
        console.error('Lỗi xóa:', error);
        showToast(error.message || 'Lỗi xóa sản phẩm.', 'error');
    }
}

// ================================================
// PRODUCT VARIANT CRUD OPERATIONS
// ================================================

function openAddVariantModal(productId, productName) {
    document.getElementById('add-variant-product-id').value = productId;
    document.getElementById('add-variant-title').textContent = `Thêm biến thể mới cho: ${productName}`;
    document.getElementById('add-variant-form').reset();
    document.getElementById('var-add-stock').value = 0;
    document.getElementById('add-variant-modal-overlay').classList.add('open');
}

function closeAddVariantModal() {
    document.getElementById('add-variant-modal-overlay').classList.remove('open');
}

async function submitAddVariant(event) {
    event.preventDefault();

    const productId = document.getElementById('add-variant-product-id').value;
    const priceVal = document.getElementById('var-add-price').value;
    const colorVal = document.getElementById('var-add-color').value.trim();
    const storageVal = document.getElementById('var-add-storage').value;
    const ramVal = document.getElementById('var-add-ram').value.trim();
    const chipVal = document.getElementById('var-add-chip').value.trim();
    const batteryVal = document.getElementById('var-add-battery').value;
    const screenSizeVal = document.getElementById('var-add-screen').value.trim();
    const resolutionVal = document.getElementById('var-add-resolution').value.trim();
    const frontCamVal = document.getElementById('var-add-front-cam').value.trim();
    const rearCamVal = document.getElementById('var-add-rear-cam').value.trim();
    const simVal = document.getElementById('var-add-sim').value.trim();
    const stockVal = document.getElementById('var-add-stock').value;
    const imageVal = document.getElementById('var-add-image').value.trim();

    if (!priceVal) {
        showToast('Vui lòng nhập giá cho biến thể.', 'error');
        return;
    }

    const body = {
        color: colorVal || null,
        storage_capacity: storageVal ? Number(storageVal) : null,
        battery_capacity: batteryVal ? Number(batteryVal) : null,
        resolution: resolutionVal || null,
        chip: chipVal || null,
        ram: ramVal || null,
        screen_size: screenSizeVal || null,
        front_camera: frontCamVal || null,
        rear_camera: rearCamVal || null,
        sim_card: simVal || null,
        price: Number(priceVal),
        total_available: stockVal ? Number(stockVal) : 0,
        variant_image_link: imageVal || null
    };

    try {
        const response = await fetch(`${API_BASE}/api/admin/products/${productId}/variants`, {
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

        showToast('Thêm biến thể thành công!');
        closeAddVariantModal();
        if (currentProductDetail && currentProductDetail.product_id == productId) {
            viewProductDetail(productId);
        }
        loadProducts(currentPage);

    } catch (error) {
        console.error('Lỗi thêm biến thể:', error);
        showToast(error.message || 'Lỗi thêm biến thể.', 'error');
    }
}

function openEditVariantModal(variantId) {
    if (!currentProductDetail || !currentProductDetail.variant) {
        showToast('Không có thông tin sản phẩm hiện tại.', 'error');
        return;
    }

    const variant = currentProductDetail.variant.find(v => v.productVariantId === variantId);
    if (!variant) {
        showToast('Không tìm thấy biến thể.', 'error');
        return;
    }

    document.getElementById('edit-variant-id').value = variantId;
    document.getElementById('var-edit-price').value = variant.price || '';
    document.getElementById('var-edit-color').value = variant.color || '';
    document.getElementById('var-edit-storage').value = variant.storageCapacity || '';
    document.getElementById('var-edit-ram').value = variant.ram || '';
    document.getElementById('var-edit-chip').value = variant.chip || '';
    document.getElementById('var-edit-battery').value = variant.batteryCapacity || '';
    document.getElementById('var-edit-screen').value = variant.screenSize || '';
    document.getElementById('var-edit-resolution').value = variant.resolution || '';
    document.getElementById('var-edit-front-cam').value = variant.frontCamera || '';
    document.getElementById('var-edit-rear-cam').value = variant.rearCamera || '';
    document.getElementById('var-edit-sim').value = variant.simCard || '';
    document.getElementById('var-edit-stock').value = variant.totalAvailable != null ? variant.totalAvailable : 0;
    document.getElementById('var-edit-image').value = variant.variantImageLink || '';

    document.getElementById('edit-variant-modal-overlay').classList.add('open');
}

function closeEditVariantModal() {
    document.getElementById('edit-variant-modal-overlay').classList.remove('open');
}

async function submitEditVariant(event) {
    event.preventDefault();

    const variantId = document.getElementById('edit-variant-id').value;
    const priceVal = document.getElementById('var-edit-price').value;
    const colorVal = document.getElementById('var-edit-color').value.trim();
    const storageVal = document.getElementById('var-edit-storage').value;
    const ramVal = document.getElementById('var-edit-ram').value.trim();
    const chipVal = document.getElementById('var-edit-chip').value.trim();
    const batteryVal = document.getElementById('var-edit-battery').value;
    const screenSizeVal = document.getElementById('var-edit-screen').value.trim();
    const resolutionVal = document.getElementById('var-edit-resolution').value.trim();
    const frontCamVal = document.getElementById('var-edit-front-cam').value.trim();
    const rearCamVal = document.getElementById('var-edit-rear-cam').value.trim();
    const simVal = document.getElementById('var-edit-sim').value.trim();
    const imageVal = document.getElementById('var-edit-image').value.trim();

    if (!priceVal) {
        showToast('Vui lòng nhập giá cho biến thể.', 'error');
        return;
    }

    const body = {
        color: colorVal || null,
        storage_capacity: storageVal ? Number(storageVal) : null,
        battery_capacity: batteryVal ? Number(batteryVal) : null,
        resolution: resolutionVal || null,
        chip: chipVal || null,
        ram: ramVal || null,
        screen_size: screenSizeVal || null,
        front_camera: frontCamVal || null,
        rear_camera: rearCamVal || null,
        sim_card: simVal || null,
        price: Number(priceVal),
        variant_image_link: imageVal || null
    };

    try {
        const response = await fetch(`${API_BASE}/api/admin/variants/${variantId}`, {
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

        showToast('Cập nhật biến thể thành công!');
        closeEditVariantModal();
        if (currentProductDetail) {
            viewProductDetail(currentProductDetail.product_id);
        }
        loadProducts(currentPage);

    } catch (error) {
        console.error('Lỗi cập nhật biến thể:', error);
        showToast(error.message || 'Lỗi cập nhật biến thể.', 'error');
    }
}

function openDeleteVariantModal(variantId, color, storageCapacity) {
    document.getElementById('delete-variant-id').value = variantId;
    
    let desc = '';
    if (color) desc += `Màu: ${color}`;
    if (storageCapacity) {
        if (desc) desc += ' - ';
        desc += `Bộ nhớ: ${storageCapacity}GB`;
    }
    if (!desc) desc = `ID: #${variantId}`;

    document.getElementById('delete-variant-desc').textContent = desc;
    document.getElementById('delete-variant-modal-overlay').classList.add('open');
}

function closeDeleteVariantModal() {
    document.getElementById('delete-variant-modal-overlay').classList.remove('open');
}

async function confirmDeleteVariant() {
    const variantId = document.getElementById('delete-variant-id').value;

    try {
        const response = await fetch(`${API_BASE}/api/admin/variants/${variantId}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });

        if (response.status === 401 || response.status === 403) {
            showToast('Phiên đăng nhập hết hạn.', 'error');
            return;
        }
        if (!response.ok) {
            const err = await response.json().catch(() => null);
            throw new Error(err?.error?.message || err?.message || `HTTP ${response.status}`);
        }

        showToast('Xóa biến thể thành công!');
        closeDeleteVariantModal();
        if (currentProductDetail) {
            viewProductDetail(currentProductDetail.product_id);
        }
        loadProducts(currentPage);

    } catch (error) {
        console.error('Lỗi xóa biến thể:', error);
        showToast(error.message || 'Không thể xóa biến thể này.', 'error');
    }
}

// ===== KEYBOARD =====
document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
        closeAddModal();
        closeEditModal();
        closeDetailModal();
        closeDeleteModal();
        closeAddVariantModal();
        closeEditVariantModal();
        closeDeleteVariantModal();
    }
});


document.addEventListener('DOMContentLoaded', function () {
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.addEventListener('keydown', function (e) {
            if (e.key === 'Enter') searchProducts();
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

    loadProducts(1);
});
