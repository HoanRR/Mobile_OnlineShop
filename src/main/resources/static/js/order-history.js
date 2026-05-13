const API_ORDERS_URL = 'http://localhost:8080/api/orders';
const statusMap = { 'WAIT': 'Cho xac nhan', 'DELIVERING': 'Dang giao hang', 'DONE': 'Hoan thanh', 'CANCEL': 'Da huy' };
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
    document.getElementById('order-detail-modal').addEventListener('click', function (e) {
        if (e.target === this) closeModal();
    });

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
        const isDone = order.order_status === 'DONE';

        html += `
            <div class="order-item">
                <div class="order-header">
                    <div>
                        <span class="order-id">Ma don: #${order.order_id}</span>
                        <span class="order-date">Ngay dat: ${dateStr}</span>
                    </div>
                    <span class="order-status status-${order.order_status}">${statusText}</span>
                </div>
                <div class="order-body">
                    <div class="order-info">
                        <div>Phuong thuc: <b>${paymentMap[order.payment_method] || order.payment_method}</b></div>
                        <div>Tong tien: <span class="order-total">${formattedTotal}</span></div>
                    </div>
                    <div style="display:flex;gap:8px;flex-wrap:wrap;justify-content:flex-end;">
                        <button class="btn-view-detail" onclick="openOrderDetail(${order.order_id})">Xem chi tiet</button>
                        ${isDone ? `<button class="btn-rebuy" onclick="muaLai(${order.order_id})">Mua lai</button>` : ''}
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
    const isDone = order.order_status === 'DONE';

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
                    </div>
                    <div style="display:flex;flex-direction:column;align-items:flex-end;gap:6px;">
                        <div class="detail-product-price">${itemPrice}</div>
                        ${isDone ? `<button class="btn-review-small" onclick="moFormDanhGia(${order.order_id}, ${item.variant_id}, '${item.product_name}')">Danh gia</button>` : ''}
                    </div>
                </div>
            `;
        });
    } else {
        itemsHtml = '<p style="color:#888;text-align:center;padding:15px;">Dang cho nhan vien phan bo san pham.</p>';
    }

    modalBody.innerHTML = `
        <div class="detail-section">
            <div class="detail-section-title">Thong tin don hang</div>
            <div class="detail-row"><span>Ma don:</span><b>#${order.order_id}</b></div>
            <div class="detail-row"><span>Ngay dat:</span><span>${dateStr}</span></div>
            <div class="detail-row"><span>Trang thai:</span>
                <span class="order-status status-${order.order_status}">${statusText}</span>
            </div>
            <div class="detail-row"><span>Thanh toan:</span><span>${paymentMap[order.payment_method] || order.payment_method}</span></div>
            <div class="detail-row"><span>Da thanh toan:</span><span>${order.is_paid ? 'Co' : 'Chua'}</span></div>
        </div>
        <div class="detail-section">
            <div class="detail-section-title">Dia chi giao hang</div>
            <div class="detail-row"><span>Nguoi nhan:</span><b>${order.delivery?.receiver_name || '-'}</b></div>
            <div class="detail-row"><span>So dien thoai:</span><span>${order.delivery?.receiver_phone || '-'}</span></div>
            <div class="detail-row"><span>Dia chi:</span><span>${order.delivery?.shipping_address || '-'}</span></div>
        </div>
        <div class="detail-section">
            <div class="detail-section-title">San pham (${order.items?.length || 0} san pham)</div>
            <div class="detail-product-list">${itemsHtml}</div>
        </div>
        <div class="detail-section detail-summary">
            ${formattedDiscount ? `<div class="detail-row"><span>Giam gia (voucher):</span><span style="color:green;">- ${formattedDiscount}</span></div>` : ''}
            <div class="detail-row detail-total"><span>Tong thanh toan:</span><b>${formattedTotal}</b></div>
        </div>
        ${isDone ? `
        <div class="detail-section" style="border-top: 1px dashed #eee; padding-top: 20px; margin-top: 5px;">
            <button class="btn-rebuy" onclick="muaLai(${order.order_id})" style="width:100%;">Mua lai toan bo don hang</button>
        </div>` : ''}
    `;
}

function closeModal() {
    document.getElementById('order-detail-modal').style.display = 'none';
    document.body.style.overflow = '';
}

// ============================================================
// Mua lai don hang (redirect sang cart)
// ============================================================
async function muaLai(orderId) {
    alert('Tinh nang Mua lai: De dat lai don hang, ban co the vao trang chi tiet san pham va them vao gio. Chuc nang tu dong them gio se co sau khi tich hop them API. Chuyen den trang gio hang...');
    window.location.href = 'cart.html';
}

// ============================================================
// Danh gia san pham (modal)
// ============================================================
function moFormDanhGia(orderId, variantId, productName) {
    // Dong modal chi tiet truoc
    document.getElementById('order-detail-modal').style.display = 'none';

    const existing = document.getElementById('review-modal');
    if (existing) existing.remove();

    const modal = document.createElement('div');
    modal.id = 'review-modal';
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-box" style="max-width: 500px;">
            <div class="modal-header">
                <h3>Danh gia san pham</h3>
                <button class="modal-close-btn" onclick="document.getElementById('review-modal').remove();">x</button>
            </div>
            <div class="modal-body">
                <p style="color:#555; margin-bottom:15px; font-weight:500;">${productName}</p>

                <div style="margin-bottom:18px;">
                    <label style="font-weight:600; display:block; margin-bottom:8px;">So sao:</label>
                    <div id="star-selector" style="display:flex; gap:8px; font-size:28px; cursor:pointer;">
                        ${[1, 2, 3, 4, 5].map(n => `<span data-star="${n}" onclick="chonSao(${n})" style="color:#ccc; transition:0.2s;">&#9733;</span>`).join('')}
                    </div>
                    <input type="hidden" id="review-rating" value="0">
                </div>

                <div style="margin-bottom:18px;">
                    <label style="font-weight:600; display:block; margin-bottom:8px;">Noi dung danh gia:</label>
                    <textarea id="review-comment" rows="4" style="width:100%; padding:10px; border:1px solid #ddd; border-radius:8px; outline:none; font-family:inherit; resize:vertical;"
                        placeholder="Chia se trai nghiem cua ban ve san pham nay..."></textarea>
                </div>

                <p id="review-error" style="color:#d70018; font-size:13px; display:none; margin-bottom:10px;"></p>

                <button onclick="guiDanhGia(${orderId}, ${variantId})"
                    style="background:#d70018; color:white; border:none; padding:12px; width:100%; border-radius:8px; font-size:15px; font-weight:600; cursor:pointer;">
                    Gui danh gia
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
        errorEl.innerText = 'Vui long chon so sao!';
        errorEl.style.display = 'block';
        return;
    }
    if (!comment) {
        errorEl.innerText = 'Vui long nhap noi dung danh gia!';
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

window.openOrderDetail = openOrderDetail;
window.closeModal = closeModal;
window.loadOrders = loadOrders;
window.muaLai = muaLai;
window.moFormDanhGia = moFormDanhGia;
window.chonSao = chonSao;
window.guiDanhGia = guiDanhGia;
