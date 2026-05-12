// ========================================================
// cart.js – Giỏ hàng + áp dụng mã giảm giá từ API
// ========================================================

let selectedItemIds = [];
let isFirstLoad = true;
let cartData = null;

// Trạng thái voucher hiện tại
let appliedVoucher = null; // { voucher_code, discount_percentage, discount_amount, final_total }

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
// Tính tổng tiền (dựa vào appliedVoucher nếu có)
// --------------------------------------------------------
function calculateTotal() {
    let subtotal = 0;

    if (cartData && cartData.items) {
        cartData.items.forEach(item => {
            if (selectedItemIds.includes(String(item.cart_detail_id))) {
                subtotal += item.variant.price * item.quantity;
            }
        });
    }

    document.getElementById('temp-total').innerText = subtotal.toLocaleString('vi-VN') + 'đ';

    const discountRow = document.querySelector('.discount-line');
    if (appliedVoucher && appliedVoucher.discount_amount > 0) {
        const discountAmt = subtotal * (appliedVoucher.discount_percentage / 100);
        const finalTotal = subtotal - discountAmt;

        discountRow.style.display = 'flex';
        document.getElementById('discount-amount').innerText = '-' + discountAmt.toLocaleString('vi-VN') + 'đ';
        document.getElementById('final-total').innerText = (finalTotal < 0 ? 0 : finalTotal).toLocaleString('vi-VN') + 'đ';
    } else {
        discountRow.style.display = 'none';
        document.getElementById('final-total').innerText = subtotal.toLocaleString('vi-VN') + 'đ';
    }
}

// --------------------------------------------------------
// API: Áp dụng mã giảm giá (gọi backend /api/vouchers/validate)
// --------------------------------------------------------
async function applyDiscount() {
    const code = document.getElementById('coupon-code').value.trim().toUpperCase();
    const msg  = document.getElementById('discount-message');

    if (!code) {
        msg.style.color = '#d70018';
        msg.innerText = 'Vui lòng nhập mã giảm giá.';
        return;
    }

    // Tính subtotal của các item đang được chọn
    let subtotal = 0;
    if (cartData && cartData.items) {
        cartData.items.forEach(item => {
            if (selectedItemIds.includes(String(item.cart_detail_id))) {
                subtotal += item.variant.price * item.quantity;
            }
        });
    }

    if (subtotal <= 0) {
        msg.style.color = '#d70018';
        msg.innerText = 'Vui lòng chọn ít nhất 1 sản phẩm để áp mã.';
        return;
    }

    const token = localStorage.getItem('accessToken');
    if (!token) {
        window.location.href = 'login.html';
        return;
    }

    // Nút loading
    const btn = document.getElementById('btn-apply-coupon');
    btn.disabled = true;
    btn.innerText = 'Đang kiểm tra...';

    try {
        const response = await fetch('http://localhost:8080/api/vouchers/validate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ voucher_code: code, order_total: subtotal })
        });

        const data = await response.json();

        if (response.ok && data.valid) {
            appliedVoucher = data; // Lưu toàn bộ kết quả
            appliedVoucher.voucher_code = code;

            msg.style.color = '#28a745';
            msg.innerText = `✓ Áp dụng thành công! Giảm ${data.discount_percentage}% (−${data.discount_amount.toLocaleString('vi-VN')}đ)`;

            calculateTotal();
        } else {
            appliedVoucher = null;
            msg.style.color = '#d70018';
            msg.innerText = data.message || 'Mã giảm giá không hợp lệ.';
            calculateTotal();
        }
    } catch (error) {
        console.error('Lỗi validate voucher:', error);
        msg.style.color = '#d70018';
        msg.innerText = 'Lỗi kết nối. Vui lòng thử lại!';
    } finally {
        btn.disabled = false;
        btn.innerText = 'Áp dụng';
    }
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

    // Lưu voucher (nếu đã áp dụng) để checkout.html dùng lại
    if (appliedVoucher) {
        localStorage.setItem('appliedVoucher', JSON.stringify(appliedVoucher));
    } else {
        localStorage.removeItem('appliedVoucher');
    }

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
            // Reset voucher khi thay đổi số lượng
            appliedVoucher = null;
            document.getElementById('discount-message').innerText = '';
            document.getElementById('coupon-code').value = '';
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
            appliedVoucher = null;
            document.getElementById('discount-message').innerText = '';
            document.getElementById('coupon-code').value = '';
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
    // Reset voucher khi thay đổi lựa chọn
    appliedVoucher = null;
    document.getElementById('discount-message').innerText = '';
    document.getElementById('coupon-code').value = '';

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

    appliedVoucher = null;
    document.getElementById('discount-message').innerText = '';
    document.getElementById('coupon-code').value = '';

    calculateTotal();
}

// --------------------------------------------------------
// Expose functions to global scope (HTML onclick)
// --------------------------------------------------------
window.proceedToCheckout   = proceedToCheckout;
window.applyDiscount       = applyDiscount;
window.updateQuantity      = updateQuantity;
window.removeCartItem      = removeCartItem;
window.toggleItemSelection = toggleItemSelection;
window.toggleSelectAll     = toggleSelectAll;