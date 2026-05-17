// ========================================================
// cart.js – Giỏ hàng + áp dụng mã giảm giá từ API
// ========================================================

let selectedItemIds = [];
let isFirstLoad = true;
let cartData = null;

// --------------------------------------------------------
// Khởi tạo
// --------------------------------------------------------
document.addEventListener('DOMContentLoaded', function () {
    const token = localStorage.getItem('accessToken');
    if (!token) {
        const container = document.getElementById('cart-items-list');
        if (!container) return;
        container.innerHTML = `<p class="thong-bao-trong">Vui lòng <a href="login.html">đăng nhập</a> để xem giỏ hàng của bạn.</p>`;
        document.querySelector('.cart-header').style.display = 'none';
        document.querySelector('.cart-summary').innerHTML = '<h3>Tóm tắt đơn hàng</h3><p>Giỏ hàng trống</p>';
        return;
    }

    loadCartFromAPI();
});

// --------------------------------------------------------
// API: Thêm vào giỏ hàng (dùng ở product-detail)
// --------------------------------------------------------
export async function addToCart(productID, quantity = 1) {
    const token = localStorage.getItem("accessToken");
    if (!token) {
        showToast('Vui lòng đăng nhập để thực hiện chức năng này!', 'warning');
        window.location.href = "login.html";
        return;
    }

    try {
        const response = await fetch('http://localhost:8080/api/cart/items', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ product_variant_id: productID, quantity: quantity })
        });

        if (response.ok) {
            showToast('Đã thêm sản phẩm vào giỏ hàng thành công!', 'success');
        } else if (response.status === 401) {
            localStorage.removeItem('accessToken');
            window.location.href = 'login.html';
        } else {
            const errorData = await response.json();
            showToast(errorData.message || 'Không thể thêm vào giỏ hàng', 'error');
        }
    } catch (error) {
        console.error('Lỗi kết nối API giỏ hàng:', error);
        showToast('Hệ thống gặp sự cố, vui lòng thử lại sau.', 'error');
    }
}

// --------------------------------------------------------
// API: Tải giỏ hàng
// --------------------------------------------------------
async function loadCartFromAPI() {
    try {
        const token = localStorage.getItem('accessToken');
        const response = await fetch('http://localhost:8080/api/cart', {
            method: 'GET',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
            cartData = await response.json();
            renderCart();
        } else if (response.status === 401) {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            window.location.href = 'login.html';
        } else {
            const container = document.getElementById('cart-items-list');
            container.innerHTML = '<p class="thong-bao-trong">Không thể tải giỏ hàng. Vui lòng thử lại!</p>';
            document.querySelector('.cart-header').style.display = 'none';
        }
    } catch (error) {
        console.error('Lỗi:', error);
        document.getElementById('cart-items-list').innerHTML =
            '<p class="thong-bao-trong">Lỗi kết nối. Vui lòng thử lại!</p>';
        document.querySelector('.cart-header').style.display = 'none';
    }
}

// --------------------------------------------------------
// Render giỏ hàng
// --------------------------------------------------------
function renderCart() {
    const container = document.getElementById('cart-items-list');

    if (!cartData || !cartData.items || cartData.items.length === 0) {
        container.innerHTML = `
            <p class="thong-bao-trong">Giỏ hàng của bạn đang trống.</p>
            <p class="thong-bao-trong">Hãy chọn thêm sản phẩm để mua sắm nhé</p>`;
        calculateTotal();
        document.querySelector('.cart-header').style.display = 'none';
        return;
    }

    document.querySelector('.cart-header').style.display = 'flex';

    if (isFirstLoad) {
        selectedItemIds = cartData.items.map(item => String(item.cart_detail_id));
        isFirstLoad = false;
    }

    let html = '';
    cartData.items.forEach((item) => {
        const itemTotal = item.variant.price * item.quantity;
        const itemIdStr = String(item.cart_detail_id);
        const isChecked = selectedItemIds.includes(itemIdStr) ? 'checked' : '';

        html += `
            <div class="cart-item">
                <input type="checkbox" class="item-checkbox" ${isChecked}
                    onchange="toggleItemSelection('${item.cart_detail_id}', this.checked)">
                <img src="${item.variant.variant_image_link}" alt="${item.variant.product_name}"
                    onerror="this.src='https://upload.wikimedia.org/wikipedia/commons/1/14/No_Image_Available.jpg'">
                <div class="item-info">
                    <h3>${item.variant.product_name}</h3>
                    <p class="item-variant">${item.variant.color} - ${item.variant.storage_capacity}GB</p>
                    <p class="item-price">${item.variant.price.toLocaleString('vi-VN')}đ</p>
                    <button class="btn-remove" onclick="removeCartItem('${item.cart_detail_id}')">Xóa khỏi giỏ</button>
                </div>
                <div class="item-quantity">
                    <button onclick="updateQuantity('${item.cart_detail_id}', ${item.quantity - 1})">-</button>
                    <span>${item.quantity}</span>
                    <button onclick="updateQuantity('${item.cart_detail_id}', ${item.quantity + 1})">+</button>
                </div>
                <div class="item-total">${itemTotal.toLocaleString('vi-VN')}đ</div>
            </div>
        `;
    });

    container.innerHTML = html;
    calculateTotal();

    const selectAllCheckbox = document.getElementById('select-all');
    if (selectAllCheckbox) {
        selectAllCheckbox.checked = (selectedItemIds.length === cartData.items.length);
    }
}

// --------------------------------------------------------
// Tính tổng tiền
// --------------------------------------------------------
function calculateTotal() {
    let total = 0;

    if (cartData && cartData.items) {
        cartData.items.forEach(item => {
            if (selectedItemIds.includes(String(item.cart_detail_id))) {
                total += item.variant.price * item.quantity;
            }
        });
    }

    document.getElementById('final-total').innerText = total.toLocaleString('vi-VN') + 'đ';
}


// --------------------------------------------------------
// Tiến hành thanh toán → chuyển sang checkout.html
// --------------------------------------------------------
function proceedToCheckout() {
    if (!selectedItemIds || selectedItemIds.length === 0) {
        showToast('Vui lòng chọn ít nhất 1 sản phẩm để thanh toán', 'warning');
        return;
    }

    localStorage.setItem('selectedCheckoutItems', JSON.stringify(selectedItemIds));
    localStorage.removeItem('appliedVoucher');

    window.location.href = 'checkout.html';
}

// --------------------------------------------------------
// Cập nhật số lượng
// --------------------------------------------------------
async function updateQuantity(cartDetailId, newQuantity) {
    if (newQuantity < 1) {
        showToast('Số lượng phải ít nhất là 1', 'warning');
        return;
    }

    try {
        const token = localStorage.getItem('accessToken');
        const response = await fetch(`http://localhost:8080/api/cart/items/${cartDetailId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ quantity: newQuantity })
        });

        if (response.ok) {
            await loadCartFromAPI();
        } else if (response.status === 401) {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            window.location.href = 'login.html';
        } else if (response.status === 400) {
            showToast('Vượt quá số lượng hàng tồn kho', 'warning');
        } else {
            showToast('Không thể cập nhật giỏ hàng. Vui lòng thử lại!', 'error');
        }
    } catch (error) {
        console.error('Lỗi:', error);
        showToast('Lỗi kết nối. Vui lòng thử lại!', 'error');
    }
}

// --------------------------------------------------------
// Xóa sản phẩm
// --------------------------------------------------------
async function removeCartItem(cartDetailId) {
    if (!confirm('Bạn có chắc chắn muốn xóa sản phẩm này khỏi giỏ hàng?')) return;

    try {
        const token = localStorage.getItem('accessToken');
        const response = await fetch(`http://localhost:8080/api/cart/items/${cartDetailId}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
            selectedItemIds = selectedItemIds.filter(id => id !== String(cartDetailId));
            await loadCartFromAPI();
        } else if (response.status === 401) {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            window.location.href = 'login.html';
        } else {
            showToast('Không thể xóa sản phẩm. Vui lòng thử lại!', 'error');
        }
    } catch (error) {
        console.error('Lỗi:', error);
        showToast('Lỗi kết nối. Vui lòng thử lại!', 'error');
    }
}

// --------------------------------------------------------
// Tick chọn sản phẩm
// --------------------------------------------------------
function toggleItemSelection(cartDetailId, isSelected) {
    const idStr = String(cartDetailId);
    if (isSelected) {
        if (!selectedItemIds.includes(idStr)) selectedItemIds.push(idStr);
    } else {
        selectedItemIds = selectedItemIds.filter(id => id !== idStr);
    }

    calculateTotal();

    const selectAllCheckbox = document.getElementById('select-all');
    if (selectAllCheckbox && cartData && cartData.items) {
        selectAllCheckbox.checked = (selectedItemIds.length === cartData.items.length);
    }
}

function toggleSelectAll() {
    const isChecked = document.getElementById('select-all').checked;
    const checkboxes = document.querySelectorAll('.item-checkbox');

    selectedItemIds = isChecked ? cartData.items.map(item => String(item.cart_detail_id)) : [];
    checkboxes.forEach(cb => cb.checked = isChecked);

    calculateTotal();
}

// --------------------------------------------------------
// Expose functions to global scope (HTML onclick)
// --------------------------------------------------------
window.proceedToCheckout   = proceedToCheckout;
window.updateQuantity      = updateQuantity;
window.removeCartItem      = removeCartItem;
window.toggleItemSelection = toggleItemSelection;
window.toggleSelectAll     = toggleSelectAll;
window.xoaToanBoGioHang    = xoaToanBoGioHang;

// --------------------------------------------------------
// Xoa toan bo gio hang
// --------------------------------------------------------
async function xoaToanBoGioHang() {
    if (!cartData || !cartData.items || cartData.items.length === 0) {
        showToast('Gio hang dang trong!', 'warning');
        return;
    }
    if (!confirm(`Ban co chac chan muon xoa tat ca ${cartData.items.length} san pham khoi gio hang?`)) return;

    const token = localStorage.getItem('accessToken');
    let hasError = false;

    // Xoa tung item (API khong co endpoint xoa tat ca)
    for (const item of cartData.items) {
        try {
            const res = await fetch(`http://localhost:8080/api/cart/items/${item.cart_detail_id}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }
            });
            if (!res.ok) hasError = true;
        } catch (e) {
            hasError = true;
        }
    }

    selectedItemIds = [];
    await loadCartFromAPI();

    if (hasError) {
        showToast('Mot so san pham khong the xoa. Vui long thu lai!', 'error');
    } else {
        showToast('Da xoa toan bo gio hang!', 'success');
    }
}
