const API_ORDERS_URL = 'http://localhost:8080/api/orders';
const statusMap = { 'WAIT': 'Chờ xác nhận', 'PROCESSING': 'Đang giao hàng', 'DELIVERED': 'Hoàn thành', 'CANCELLED': 'Đã hủy' };
const paymentMap = { 'COD': 'Thanh toan khi nhan hang (COD)', 'BANK': 'Chuyen khoan ngan hang' };

document.addEventListener("DOMContentLoaded", function () {
    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) {
        alert("Vui long dang nhap de xem thong tin ca nhan!");
        window.location.href = 'login.html';
        return;
    }

    const userInfo = JSON.parse(localStorage.getItem('userInfo')) || {};
    document.getElementById('sidebar-name').innerText = userInfo.name || userInfo.username || 'Tài khoản';

    document.querySelectorAll('.tab-btn').forEach(tab => {
        tab.addEventListener('click', function () {
            document.querySelectorAll('.tab-btn').forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            loadOrders(this.getAttribute('data-status'), 1);
        });
    });

    // Close modal on overlay click
    const detailModal = document.getElementById('order-detail-modal');
    if (detailModal) {
        detailModal.addEventListener('click', function (e) {
            if (e.target === this) closeModal();
        });
    }

    loadOrders('', 1);
});

// ============================================================
// Tai danh sach don hang
// ============================================================
async function loadOrders(status = '', page = 1) {
    const accessToken = localStorage.getItem('accessToken');
    const orderListContainer = document.getElementById('order-list');

    orderListContainer.innerHTML = '<div style="text-align:center;padding:30px;color:#888;">Dang tai danh sach don hang...</div>';

    let url = `${API_ORDERS_URL}?page=${page}&limit=5`;
    if (status) url += `&order_status=${status}`;

    try {
        const response = await fetch(url, {
            headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' }
        });

        if (response.status === 401) { xuLyDangXuat(); return; }
        if (!response.ok) throw new Error(`Loi HTTP: ${response.status}`);

        const data = await response.json();
        renderOrders(data.data);
        renderPagination(data.pagination, status);

    } catch (error) {
        console.error("Loi khi tai don hang:", error);
        orderListContainer.innerHTML = '<div style="text-align:center;color:red;padding:30px;">Khong the tai danh sach. Vui long thu lai.</div>';
    }
}

function renderOrders(orders) {
    const container = document.getElementById('order-list');

    if (!orders || orders.length === 0) {
        container.innerHTML = '<div style="text-align:center;padding:50px;color:#aaa;font-size:16px;">Bạn chưa có đơn hàng nào trong trạng thái này.</div>';
        return;
    }

    let html = '';
    orders.forEach(order => {
        const dateStr = new Date(order.order_date).toLocaleString('vi-VN');
        const statusText = statusMap[order.order_status] || order.order_status;
        const formattedTotal = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(order.total_amount);
        const isDone = order.order_status === 'DELIVERED';

        html += `
            <div class="order-item">
                <div class="order-header">
                    <div>
                        <span class="order-id">Mã đơn: #${order.order_id}</span>
                        <span class="order-date">Ngày đặt: ${dateStr}</span>
                    </div>
                    <span class="order-status status-${order.order_status}">${statusText}</span>
                </div>
                <div class="order-body">
                    <div class="order-info">
                        <div>Phương thức: <b>${paymentMap[order.payment_method] || order.payment_method}</b></div>
                        <div>Tổng tiền: <span class="order-total">${formattedTotal}</span></div>
                    </div>
                    <div style="display:flex;gap:8px;flex-wrap:wrap;justify-content:flex-end;">
                        <button class="btn-view-detail" onclick="openOrderDetail(${order.order_id})">Xem chi tiết</button>
                        ${isDone ? `
                            <button class="btn-review-outline" onclick="danhGiaOrder(${order.order_id})">Đánh giá</button>
                            <button class="btn-rebuy" onclick="muaLai(${order.order_id})">Mua lại</button>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;
    });

    container.innerHTML = html;
}

function renderPagination(pagination, currentStatus) {
    const container = document.getElementById('pagination');
    if (!pagination || pagination.totalPages <= 1) { container.innerHTML = ''; return; }

    let html = '';
    for (let i = 1; i <= pagination.totalPages; i++) {
        const activeClass = i === pagination.currentPage ? 'active' : '';
        html += `<button class="page-btn ${activeClass}" onclick="loadOrders('${currentStatus}', ${i})">${i}</button>`;
    }
    container.innerHTML = html;
}

// ============================================================
// Modal xem chi tiet don hang
// ============================================================
async function openOrderDetail(orderId) {
    const accessToken = localStorage.getItem('accessToken');
    const modal = document.getElementById('order-detail-modal');
    const modalBody = document.getElementById('modal-body');

    modal.style.display = 'flex';
    modalBody.innerHTML = '<div class="modal-loading">Dang tai chi tiet don hang...</div>';
    document.body.style.overflow = 'hidden';

    try {
        const response = await fetch(`${API_ORDERS_URL}/${orderId}`, {
            headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' }
        });
        if (!response.ok) throw new Error(`Loi: ${response.status}`);
        const order = await response.json();
        renderOrderDetail(order);
    } catch (error) {
        modalBody.innerHTML = '<p style="color:red;text-align:center;">Khong the tai chi tiet. Vui long thu lai.</p>';
    }
}

function renderOrderDetail(order) {
    const modalBody = document.getElementById('modal-body');
    const statusText = statusMap[order.order_status] || order.order_status;
    const formattedTotal = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(order.total_amount);
    const formattedDiscount = order.discount_amount
        ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(order.discount_amount)
        : null;
    const dateStr = new Date(order.order_date).toLocaleString('vi-VN');
    const isDone = order.order_status === 'DELIVERED';

    let itemsHtml = '';
    if (order.items && order.items.length > 0) {
        order.items.forEach(item => {
            const itemPrice = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.price_at_purchase);
            itemsHtml += `
                <div class="detail-product-item">
                    <div class="detail-product-info">
                        <div class="detail-product-name">${item.product_name}</div>
                        <div class="detail-product-variant">${item.color} - ${item.storage_capacity}GB</div>
                        ${item.imei ? `<div class="detail-product-imei">IMEI: ${item.imei}</div>` : ''}
                        ${item.imei && item.device_status ? `
                            <div style="margin-top: 4px;">
                                ${item.device_status === 'SOLD' ? '<span style="background:#28a745;color:white;padding:2px 8px;border-radius:4px;font-size:11px;font-weight:600;">Sử dụng</span>' : ''}
                                ${item.device_status === 'WARRANTY' ? '<span style="background:#ff9800;color:white;padding:2px 8px;border-radius:4px;font-size:11px;font-weight:600;">Đang bảo hành</span>' : ''}
                                ${item.device_status === 'RETURNED' ? '<span style="background:#dc3545;color:white;padding:2px 8px;border-radius:4px;font-size:11px;font-weight:600;">Đã đổi/trả</span>' : ''}
                            </div>
                        ` : ''}
                    </div>
                    <div style="display:flex;flex-direction:column;align-items:flex-end;gap:6px;">
                        <div class="detail-product-price">${itemPrice}</div>
                        ${isDone ? `
                            <button class="btn-review-small" onclick="moFormDanhGia(${order.order_id}, ${item.variant_id}, '${item.product_name}')">Đánh giá</button>
                            <button class="btn-review-small" onclick="window.location.href='product-detail.html?id=${item.product_id}'">Mua lại</button>
                            ${(item.imei && item.device_status === 'SOLD') ? `
                                <button class="btn-review-small btn-warranty-request" style="background-color:#f5a623; color:white; border:none;" onclick="moFormYeuCauBaoHanhDoiTra('${item.imei}', '${item.product_name} (${item.color} - ${item.storage_capacity}GB)')">Bảo hành / Đổi trả</button>
                            ` : ''}
                        ` : ''}
                    </div>
                </div>
            `;
        });
    } else {
        itemsHtml = '<p style="color:#888;text-align:center;padding:15px;">Dang cho nhan vien phan bo san pham.</p>';
    }

    modalBody.innerHTML = `
        <div class="detail-section">
            <div class="detail-section-title">Thông tin đơn hàng</div>
            <div class="detail-row"><span>Mã đơn:</span><b>#${order.order_id}</b></div>
            <div class="detail-row"><span>Ngày đặt:</span><span>${dateStr}</span></div>
            <div class="detail-row"><span>Trạng thái:</span>
                <span class="order-status status-${order.order_status}">${statusText}</span>
            </div>
            <div class="detail-row"><span>Thanh toán:</span><span>${paymentMap[order.payment_method] || order.payment_method}</span></div>
            <div class="detail-row"><span>Đã thanh toán:</span><span>${order.is_paid ? 'Co' : 'Chua'}</span></div>
        </div>
        <div class="detail-section">
            <div class="detail-section-title">Địa chỉ giao hàng</div>
            <div class="detail-row"><span>Người nhận:</span><b>${order.delivery?.receiver_name || '-'}</b></div>
            <div class="detail-row"><span>Số điện thoại:</span><span>${order.delivery?.receiver_phone || '-'}</span></div>
            <div class="detail-row"><span>Địa chỉ:</span><span>${order.delivery?.shipping_address || '-'}</span></div>
        </div>
        <div class="detail-section">
            <div class="detail-section-title">Sản phẩm (${order.items?.length || 0} sản phẩm)</div>
            <div class="detail-product-list">${itemsHtml}</div>
        </div>
        <div class="detail-section detail-summary">
            ${formattedDiscount ? `<div class="detail-row"><span>Giam gia (voucher):</span><span style="color:green;">- ${formattedDiscount}</span></div>` : ''}
            <div class="detail-row detail-total"><span>Tong thanh toan:</span><b>${formattedTotal}</b></div>
        </div>
    `;
}

function closeModal() {
    document.getElementById('order-detail-modal').style.display = 'none';
    document.body.style.overflow = '';
}


// ============================================================
// Mua lai (tu ngoai danh sach don hang)
// ============================================================
async function muaLai(orderId) {
    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) return;

    try {
        const response = await fetch(`${API_ORDERS_URL}/${orderId}`, {
            headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' }
        });
        
        if (response.status === 401) {
            alert('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
            localStorage.removeItem('accessToken');
            window.location.href = 'login.html';
            return;
        }
        if (!response.ok) throw new Error("Khong the tai don hang");
        const order = await response.json();
        
        if (order.items && order.items.length > 0) {
            // Chuyển hướng đến sản phẩm đầu tiên trong đơn hàng
            window.location.href = `product-detail.html?id=${order.items[0].product_id}`;
        } else {
            alert("Đơn hàng không có sản phẩm nào để mua lại!");
        }
    } catch (error) {
        console.error("Lỗi mua lại:", error);
    }
}

// ============================================================
// Danh gia tu ngoai danh sach
// ============================================================
async function danhGiaOrder(orderId) {
    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) return;

    try {
        const response = await fetch(`${API_ORDERS_URL}/${orderId}`, {
            headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' }
        });
        
        if (response.status === 401) {
            alert('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
            localStorage.removeItem('accessToken');
            window.location.href = 'login.html';
            return;
        }
        if (!response.ok) throw new Error("Khong the tai don hang");
        const order = await response.json();
        
        if (order.items && order.items.length > 0) {
            const firstItem = order.items[0];
            moFormDanhGia(order.order_id, firstItem.variant_id, firstItem.product_name);
        } else {
            alert("Đơn hàng không có sản phẩm nào để đánh giá!");
        }
    } catch (error) {
        console.error("Lỗi:", error);
    }
}

function moFormDanhGia(orderId, variantId, productName) {
    // Dong modal chi tiet truoc
    const detailModal = document.getElementById('order-detail-modal');
    if (detailModal) detailModal.style.display = 'none';

    const existing = document.getElementById('review-modal');
    if (existing) existing.remove();

    const modal = document.createElement('div');
    modal.id = 'review-modal';
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-box" style="max-width: 500px;">
            <div class="modal-header">
                <h3>Đánh giá sản phẩm</h3>
                <button class="modal-close-btn" onclick="document.getElementById('review-modal').remove();">x</button>
            </div>
            <div class="modal-body">
                <p style="color:#555; margin-bottom:15px; font-weight:500;">${productName}</p>

                <div style="margin-bottom:18px;">
                    <label style="font-weight:600; display:block; margin-bottom:8px;">Số sao:</label>
                    <div id="star-selector" style="display:flex; gap:8px; font-size:28px; cursor:pointer;">
                        ${[1, 2, 3, 4, 5].map(n => `<span data-star="${n}" onclick="chonSao(${n})" style="color:#ccc; transition:0.2s;">&#9733;</span>`).join('')}
                    </div>
                    <input type="hidden" id="review-rating" value="0">
                </div>

                <div style="margin-bottom:18px;">
                    <label style="font-weight:600; display:block; margin-bottom:8px;">Nội dung đánh giá:</label>
                    <textarea id="review-comment" rows="4" style="width:100%; padding:10px; border:1px solid #ddd; border-radius:8px; outline:none; font-family:inherit; resize:vertical;"
                        placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm này..."></textarea>
                </div>

                <p id="review-error" style="color:#d70018; font-size:13px; display:none; margin-bottom:10px;"></p>

                <button onclick="guiDanhGia(${orderId}, ${variantId})"
                    style="background:#d70018; color:white; border:none; padding:12px; width:100%; border-radius:8px; font-size:15px; font-weight:600; cursor:pointer;">
                    Gửi đánh giá
                </button>
            </div>
        </div>
    `;
    modal.addEventListener('click', e => { if (e.target === modal) modal.remove(); });
    document.body.appendChild(modal);
}

function chonSao(n) {
    document.getElementById('review-rating').value = n;
    document.querySelectorAll('#star-selector span').forEach((s, i) => {
        s.style.color = i < n ? '#f5a623' : '#ccc';
    });
}

async function guiDanhGia(orderId, variantId) {
    const rating = parseInt(document.getElementById('review-rating').value);
    const comment = document.getElementById('review-comment').value.trim();
    const errorEl = document.getElementById('review-error');

    if (!rating || rating < 1) {
        errorEl.innerText = 'Vui lòng chọn số sao!';
        errorEl.style.display = 'block';
        return;
    }
    if (!comment) {
        errorEl.innerText = 'Vui lòng nhập nội dung đánh giá!';
        errorEl.style.display = 'block';
        return;
    }

    const accessToken = localStorage.getItem('accessToken');

    // Lay product_id tu variant_id qua order detail (da co order data)
    // API: POST /api/products/{product_id}/reviews
    // Can biet product_id - tam thoi lay tu order items
    // De don gian, goi API lay chi tiet de lay product info
    try {
        const body = { rating, comment, order_id: orderId, product_variant_id: variantId };
        // Tim product_id - lay de goi API review
        // Thuc ra API review can product_id, lay tu cau hinh order
        const orderRes = await fetch(`${API_ORDERS_URL}/${orderId}`, {
            headers: { 'Authorization': `Bearer ${accessToken}` }
        });
        const orderData = await orderRes.json();
        const item = orderData.items?.find(it => it.variant_id === variantId);

        if (!item) {
            errorEl.innerText = 'Khong tim thay san pham trong don hang!';
            errorEl.style.display = 'block';
            return;
        }

        // Lay product_id tu product detail (can biet product_id cua variant)
        // Tam thoi dung variant_id de goi review - backend se tim product
        const reviewRes = await fetch(`http://localhost:8080/api/products/${variantId}/reviews`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });

        if (reviewRes.ok) {
            document.getElementById('review-modal').remove();
            showToast('Cam on ban da danh gia san pham!', 'success');
        } else {
                const err = await reviewRes.json();
            errorEl.innerText = err.message || 'Gui danh gia that bai. Vui long thu lai!';
            errorEl.style.display = 'block';
        }
    } catch (err) {
        console.error(err);
        errorEl.innerText = 'Loi ket noi. Vui long thu lai!';
        errorEl.style.display = 'block';
    }
}

function moFormYeuCauBaoHanhDoiTra(imei, productNameAndVariant) {
    const detailModal = document.getElementById('order-detail-modal');
    if (detailModal) detailModal.style.display = 'none';

    const existing = document.getElementById('warranty-return-modal');
    if (existing) existing.remove();

    const modal = document.createElement('div');
    modal.id = 'warranty-return-modal';
    modal.className = 'modal-overlay';
    modal.style.display = 'flex';
    modal.innerHTML = `
        <div class="modal-box" style="max-width: 500px;">
            <div class="modal-header">
                <h3>Yêu cầu Bảo hành / Đổi trả</h3>
                <button class="modal-close-btn" onclick="document.getElementById('warranty-return-modal').remove();">x</button>
            </div>
            <div class="modal-body">
                <p style="color:#555; margin-bottom:15px; font-weight:500;">Sản phẩm: <b>${productNameAndVariant}</b></p>
                <p style="color:#777; font-size:13px; margin-bottom:15px;">IMEI: <b>${imei}</b></p>

                <div style="margin-bottom:18px;">
                    <label style="font-weight:600; display:block; margin-bottom:8px;">Loại yêu cầu:</label>
                    <select id="request-type" style="width:100%; padding:10px; border:1px solid #ddd; border-radius:8px; outline:none; font-family:inherit;">
                        <option value="WARRANTY">Yêu cầu sửa chữa/Bảo hành</option>
                        <option value="RETURN">Yêu cầu Đổi trả sản phẩm</option>
                    </select>
                </div>

                <div style="margin-bottom:18px;">
                    <label style="font-weight:600; display:block; margin-bottom:8px;">Lý do yêu cầu:</label>
                    <textarea id="request-reason" rows="4" style="width:100%; padding:10px; border:1px solid #ddd; border-radius:8px; outline:none; font-family:inherit; resize:vertical;"
                        placeholder="Mô tả chi tiết lỗi thiết bị hoặc lý do đổi trả sản phẩm..."></textarea>
                </div>

                <p id="request-error" style="color:#d70018; font-size:13px; display:none; margin-bottom:10px;"></p>

                <button onclick="guiYeuCau('${imei}')"
                    style="background:#f5a623; color:white; border:none; padding:12px; width:100%; border-radius:8px; font-size:15px; font-weight:600; cursor:pointer; transition: 0.2s;">
                    Gửi yêu cầu
                </button>
            </div>
        </div>
    `;
    modal.addEventListener('click', e => { if (e.target === modal) modal.remove(); });
    document.body.appendChild(modal);
}

async function guiYeuCau(imei) {
    const type = document.getElementById('request-type').value;
    const reason = document.getElementById('request-reason').value.trim();
    const errorEl = document.getElementById('request-error');

    if (!reason) {
        errorEl.innerText = 'Vui lòng nhập lý do yêu cầu!';
        errorEl.style.display = 'block';
        return;
    }

    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) {
        window.location.href = 'login.html';
        return;
    }

    try {
        const response = await fetch('http://localhost:8080/api/orders/warranty-return', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ imei, type, reason })
        });

        if (response.ok) {
            document.getElementById('warranty-return-modal').remove();
            showToast('Yêu cầu đã được gửi thành công!', 'success');
            // Reload list
            loadOrders('', 1);
        } else {
            const err = await response.json();
            errorEl.innerText = err.message || 'Gửi yêu cầu thất bại. Vui lòng thử lại!';
            errorEl.style.display = 'block';
        }
    } catch (err) {
        console.error(err);
        errorEl.innerText = 'Lỗi kết nối. Vui lòng thử lại!';
        errorEl.style.display = 'block';
    }
}

window.openOrderDetail = openOrderDetail;
window.closeModal = closeModal;
window.loadOrders = loadOrders;
window.muaLai = muaLai;
window.danhGiaOrder = danhGiaOrder;
window.moFormDanhGia = moFormDanhGia;
window.chonSao = chonSao;
window.guiDanhGia = guiDanhGia;
window.moFormYeuCauBaoHanhDoiTra = moFormYeuCauBaoHanhDoiTra;
window.guiYeuCau = guiYeuCau;
