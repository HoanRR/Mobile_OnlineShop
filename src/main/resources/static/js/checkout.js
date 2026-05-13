// ========================================================
// checkout.js – Trang thanh toán + áp dụng mã giảm giá
// ========================================================

let cartData = null;
let appliedVoucher = null; // Voucher đang được áp dụng

// --------------------------------------------------------
// Khởi tạo
// --------------------------------------------------------
document.addEventListener('DOMContentLoaded', function () {
    const token = localStorage.getItem('accessToken');
    if (!token) {
        showToast('Vui lòng đăng nhập để tiếp tục thanh toán!', 'warning');
        window.location.href = 'login.html';
        return;
    }

    // Khôi phục voucher đã áp dụng từ cart (nếu có)
    const savedVoucher = localStorage.getItem('appliedVoucher');
    if (savedVoucher) {
        appliedVoucher = JSON.parse(savedVoucher);
        const codeInput = document.getElementById('checkout-coupon-code');
        if (codeInput) codeInput.value = appliedVoucher.voucher_code || '';
    }

    loadCartFromAPI();
    fillUserData();

    const form = document.getElementById('form-thanh-toan');
    if (form) form.addEventListener('submit', (e) => { e.preventDefault(); xuLyDatHang(); });
});

// --------------------------------------------------------
// API: Tải giỏ hàng và lọc item đã chọn
// --------------------------------------------------------
async function loadCartFromAPI() {
    try {
        const token = localStorage.getItem('accessToken');
        const response = await fetch('http://localhost:8080/api/cart', {
            method: 'GET',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
            const fullCartData = await response.json();

            const selectedItemsStr = localStorage.getItem('selectedCheckoutItems');
            if (!selectedItemsStr) {
                showToast('Bạn chưa chọn sản phẩm nào để thanh toán!', 'warning');
                window.location.href = 'cart.html';
                return;
            }

            const selectedItemIds = JSON.parse(selectedItemsStr);
            cartData = { ...fullCartData };
            cartData.items = fullCartData.items.filter(item =>
                selectedItemIds.includes(String(item.cart_detail_id))
            );

            if (cartData.items.length === 0) {
                showToast('Sản phẩm bạn chọn không còn trong giỏ hàng!', 'warning');
                window.location.href = 'cart.html';
                return;
            }

            renderCheckoutItems();
        } else if (response.status === 401) {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            window.location.href = 'login.html';
        } else {
            showToast('Không thể tải giỏ hàng. Vui lòng thử lại!', 'error');
        }
    } catch (error) {
        console.error('Lỗi:', error);
        showToast('Lỗi kết nối đến máy chủ!', 'error');
    }
}

// --------------------------------------------------------
// Render danh sách sản phẩm trong đơn
// --------------------------------------------------------
function renderCheckoutItems() {
    if (!cartData || !cartData.items || cartData.items.length === 0) {
        showToast('Giỏ hàng của bạn trống!', 'warning');
        window.location.href = 'cart.html';
        return;
    }

    let html = '';
    let subtotal = 0;

    cartData.items.forEach(item => {
        const itemTotal = item.variant.price * item.quantity;
        subtotal += itemTotal;

        html += `
            <div class="checkout-item">
                <img src="${item.variant.image_link || item.variant.variant_image_link}"
                    alt="${item.variant.product_name}"
                    onerror="this.src='https://upload.wikimedia.org/wikipedia/commons/1/14/No_Image_Available.jpg'">
                <div class="checkout-item-info">
                    <h4>${item.variant.product_name}</h4>
                    <p>${item.variant.color} - ${item.variant.storage_capacity}GB</p>
                    <p class="item-price">${item.variant.price.toLocaleString('vi-VN')}đ</p>
                </div>
                <div class="checkout-item-qty">x${item.quantity}</div>
                <div class="checkout-item-total">${itemTotal.toLocaleString('vi-VN')}đ</div>
            </div>
        `;
    });

    document.getElementById('checkout-items-list').innerHTML = html;
    recalculateCheckoutTotal(subtotal);

    // Nếu có voucher từ cart, hiển thị thông báo thành công
    if (appliedVoucher) {
        const msg = document.getElementById('checkout-discount-message');
        msg.style.color = '#28a745';
        msg.innerText = `✓ Đang áp dụng mã "${appliedVoucher.voucher_code}" – Giảm ${appliedVoucher.discount_percentage}%`;
    }
}

// --------------------------------------------------------
// Tính lại tổng tiền hiển thị trên checkout
// --------------------------------------------------------
function recalculateCheckoutTotal(subtotalParam) {
    let subtotal = subtotalParam;

    // Nếu không truyền vào, tính lại từ cartData
    if (subtotal === undefined) {
        subtotal = 0;
        if (cartData && cartData.items) {
            cartData.items.forEach(item => { subtotal += item.variant.price * item.quantity; });
        }
    }

    document.getElementById('checkout-subtotal').innerText = subtotal.toLocaleString('vi-VN') + 'đ';

    const discountRow = document.getElementById('checkout-discount-row');

    if (appliedVoucher && appliedVoucher.discount_percentage > 0) {
        const discountAmt = subtotal * (appliedVoucher.discount_percentage / 100);
        const finalTotal  = Math.max(0, subtotal - discountAmt);

        discountRow.style.display = 'flex';
        document.getElementById('checkout-discount-amount').innerText =
            '-' + discountAmt.toLocaleString('vi-VN') + 'đ';
        document.getElementById('checkout-total').innerText =
            finalTotal.toLocaleString('vi-VN') + 'đ';
    } else {
        discountRow.style.display = 'none';
        document.getElementById('checkout-total').innerText =
            subtotal.toLocaleString('vi-VN') + 'đ';
    }
}

// --------------------------------------------------------
// Áp dụng mã giảm giá tại trang checkout
// --------------------------------------------------------
window.applyDiscountCheckout = async function () {
    const code = document.getElementById('checkout-coupon-code').value.trim().toUpperCase();
    const msg  = document.getElementById('checkout-discount-message');

    if (!code) {
        msg.style.color = '#d70018';
        msg.innerText = 'Vui lòng nhập mã giảm giá.';
        return;
    }

    // Tính subtotal
    let subtotal = 0;
    if (cartData && cartData.items) {
        cartData.items.forEach(item => { subtotal += item.variant.price * item.quantity; });
    }

    const token = localStorage.getItem('accessToken');
    if (!token) { window.location.href = 'login.html'; return; }

    // Disable nút
    const btn = document.querySelector('.discount-section button');
    if (btn) { btn.disabled = true; btn.innerText = 'Đang kiểm tra...'; }

    try {
        const response = await fetch('http://localhost:8080/api/vouchers/validate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ voucher_code: code, order_total: subtotal })
        });

        const data = await response.json();

        if (response.ok && data.valid) {
            appliedVoucher = { ...data, voucher_code: code };
            localStorage.setItem('appliedVoucher', JSON.stringify(appliedVoucher));

            msg.style.color = '#28a745';
            msg.innerText = `✓ Áp dụng thành công! Giảm ${data.discount_percentage}% (−${data.discount_amount.toLocaleString('vi-VN')}đ)`;
            recalculateCheckoutTotal();
        } else {
            appliedVoucher = null;
            localStorage.removeItem('appliedVoucher');
            msg.style.color = '#d70018';
            msg.innerText = data.message || 'Mã giảm giá không hợp lệ.';
            recalculateCheckoutTotal();
        }
    } catch (error) {
        console.error('Lỗi validate voucher:', error);
        msg.style.color = '#d70018';
        msg.innerText = 'Lỗi kết nối. Vui lòng thử lại!';
    } finally {
        if (btn) { btn.disabled = false; btn.innerText = 'Áp dụng'; }
    }
};

// --------------------------------------------------------
// Xóa voucher
// --------------------------------------------------------
window.removeVoucher = function () {
    appliedVoucher = null;
    localStorage.removeItem('appliedVoucher');
    document.getElementById('checkout-coupon-code').value = '';
    document.getElementById('checkout-discount-message').innerText = '';
    recalculateCheckoutTotal();
};

// --------------------------------------------------------
// Điền thông tin user từ localStorage
// --------------------------------------------------------
function fillUserData() {
    const userString = localStorage.getItem('currentUser');
    if (userString) {
        const user = JSON.parse(userString);
        const hoTenInput = document.getElementById('ho-ten');
        if (hoTenInput && !hoTenInput.value) hoTenInput.value = user.full_name || user.username || '';
        const sdtInput = document.getElementById('so-dien-thoai');
        if (sdtInput && !sdtInput.value) sdtInput.value = user.phone_number || '';
    }
}

// --------------------------------------------------------
// Validate form
// --------------------------------------------------------
function validateCheckoutForm() {
    const hoTen  = document.getElementById('ho-ten').value.trim();
    const sdt    = document.getElementById('so-dien-thoai').value.trim();
    const diaChi = document.getElementById('dia-chi').value.trim();
    const errors = [];

    if (!hoTen) {
        errors.push("Vui lòng nhập họ và tên");
    }

    if (!sdt) {
        errors.push("Vui lòng nhập số điện thoại");
    } else if (!/^(0|\+84)[0-9]{9}$/.test(sdt)) {
        errors.push("Số điện thoại không hợp lệ (phải bắt đầu từ 0 và có 10 chữ số)");
    }

    if (!diaChi) {
        errors.push("Vui lòng nhập địa chỉ giao hàng");
    }

    if (errors.length > 0) {
        alert("Lỗi:\n" + errors.join("\n"));
        return false;
    }

    return true;
}

// --------------------------------------------------------
// Đặt hàng – gửi POST /api/orders kèm voucher_code
// --------------------------------------------------------
async function xuLyDatHang() {
    if (!validateCheckoutForm()) return;

    if (!cartData || !cartData.items || cartData.items.length === 0) {
        alert('Giỏ hàng của bạn trống!');
        return;
    }

    const hoTen      = document.getElementById('ho-ten').value.trim();
    const sdt        = document.getElementById('so-dien-thoai').value.trim();
    const diaChi     = document.getElementById('dia-chi').value.trim();
    const phuongThuc = document.querySelector('input[name="payment"]:checked').value;

    const items = cartData.items.map(item => ({
        cart_detail_id: item.cart_detail_id,
        quantity: item.quantity
    }));

    const orderRequest = {
        receiver_name:    hoTen,
        receiver_phone:   sdt,
        shipping_address: diaChi,
        payment_method:   phuongThuc,
        items:            items
    };

    // Gắn voucher_code nếu đã áp dụng
    if (appliedVoucher && appliedVoucher.voucher_code) {
        orderRequest.voucher_code = appliedVoucher.voucher_code;
    }

    // Disable nút submit để tránh double-click
    const btnSubmit = document.querySelector('.btn-xac-nhan');
    if (btnSubmit) { btnSubmit.disabled = true; btnSubmit.innerText = 'Đang xử lý...'; }

    try {
        const token = localStorage.getItem('accessToken');
        const response = await fetch('http://localhost:8080/api/orders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify(orderRequest)
        });

        if (response.ok) {
            const orderResponse = await response.json();

            // Lưu thông tin đơn hàng để hiển thị trang success
            localStorage.setItem('lastOrder', JSON.stringify(orderResponse));
            localStorage.removeItem('cart');
            localStorage.removeItem('appliedVoucher');
            localStorage.removeItem('selectedCheckoutItems');

            window.location.href = 'order-success.html';
        } else if (response.status === 401) {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            window.location.href = 'login.html';
        } else {
            const errorData = await response.json();
            // Nếu lỗi do voucher → xóa voucher và thông báo
            if (errorData.code && errorData.code.includes('VOUCHER')) {
                appliedVoucher = null;
                localStorage.removeItem('appliedVoucher');
                document.getElementById('checkout-coupon-code').value = '';
                const msg = document.getElementById('checkout-discount-message');
                msg.style.color = '#d70018';
                msg.innerText = errorData.message || 'Mã giảm giá không còn hiệu lực.';
                recalculateCheckoutTotal();
            }
            showToast(errorData.message || 'Đặt hàng thất bại. Vui lòng thử lại!', 'error');
        }
    } catch (error) {
        console.error('Lỗi:', error);
        showToast('Lỗi kết nối. Vui lòng thử lại sau!', 'error');
    } finally {
        if (btnSubmit) { btnSubmit.disabled = false; btnSubmit.innerText = 'Xác nhận đặt hàng'; }
    }
}
