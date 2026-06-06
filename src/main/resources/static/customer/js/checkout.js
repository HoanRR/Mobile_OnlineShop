
let cartData = null;
let appliedVoucher = null; // Voucher đang được áp dụng


document.addEventListener('DOMContentLoaded', function () {
    const token = localStorage.getItem('accessToken');
    if (!token) {
        showToast('Vui lòng đăng nhập để thực hiện chức năng này!', 'warning');

        setTimeout(() => {
            window.location.href = "login";
        }, 2000);

        return;
    }
    loadCartFromAPI();
    fillUserData();

    const form = document.getElementById('form-thanh-toan');
    if (form) form.addEventListener('submit', (e) => { e.preventDefault(); xuLyDatHang(); });
});


// Tải giỏ hàng và lọc item đã chọn
async function loadCartFromAPI() {
    try {
        const token = localStorage.getItem('accessToken');

        // Kiểm tra xem có đơn hàng mua trực tiếp hay không
        const directCheckoutItemStr = localStorage.getItem('directCheckoutItem');
        if (directCheckoutItemStr) {
            const directItem = JSON.parse(directCheckoutItemStr);
            cartData = {
                items: [directItem],
                total: directItem.variant.price * directItem.quantity
            };
            renderCheckoutItems();
            return;
        }

        const response = await fetch('http://localhost:8080/api/cart', {
            method: 'GET',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
            const fullCartData = await response.json();

            const selectedItemsStr = localStorage.getItem('selectedCheckoutItems');
            if (!selectedItemsStr) {
                showToast('Bạn chưa chọn sản phẩm nào để thanh toán!', 'warning');

                setTimeout(() => {
                    window.location.href = 'cart';
                }, 2000);
                return;
            }

            const selectedItemIds = JSON.parse(selectedItemsStr);
            cartData = { ...fullCartData };
            cartData.items = fullCartData.items.filter(item =>
                selectedItemIds.includes(String(item.cart_detail_id))
            );

            if (cartData.items.length === 0) {
                showToast('Sản phẩm bạn chọn không còn trong giỏ hàng!', 'warning');
                window.location.href = 'cart';
                return;
            }

            renderCheckoutItems();
        } else if (response.status === 401) {
            xuLyDangXuat();
        } else {
            showToast('Không thể tải giỏ hàng. Vui lòng thử lại!', 'error');
        }
    } catch (error) {
        console.error('Lỗi:', error);
        showToast('Lỗi kết nối đến máy chủ!', 'error');
    }
}

// Render danh sách sản phẩm trong đơn
function renderCheckoutItems() {
    if (!cartData || !cartData.items || cartData.items.length === 0) {
        showToast('Giỏ hàng của bạn trống!', 'warning');
        window.location.href = 'cart';
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
                    ">
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


}

// Tính lại tổng tiền hiển thị trên checkout
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
        const discountAmt = appliedVoucher.discount_amount !== undefined && appliedVoucher.discount_amount !== null ? appliedVoucher.discount_amount : (subtotal * (appliedVoucher.discount_percentage / 100));
        const finalTotal = Math.max(0, subtotal - discountAmt);

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

// Áp dụng mã giảm giá tại trang checkout
window.applyDiscountCheckout = async function () {
    const code = document.getElementById('checkout-coupon-code').value.trim().toUpperCase();
    const msg = document.getElementById('checkout-discount-message');

    if (!code) {
        msg.style.color = '#d70018';
        msg.innerText = 'Vui lòng nhập mã giảm giá.';
        if (localStorage.getItem("appliedVoucher")) {
            localStorage.removeItem("appliedVoucher");
        }
        appliedVoucher = null;
        recalculateCheckoutTotal();
        return;
    }

    // Tính subtotal
    let subtotal = 0;
    if (cartData && cartData.items) {
        cartData.items.forEach(item => { subtotal += item.variant.price * item.quantity; });
    }

    const variantIds = cartData && cartData.items
        ? cartData.items.map(item => item.variant.product_variant_id)
        : [];

    const token = localStorage.getItem('accessToken');
    if (!token) { window.location.href = 'login'; return; }

    // Disable nút
    const btn = document.querySelector('.discount-section button');
    if (btn) { btn.disabled = true; btn.innerText = 'Đang kiểm tra...'; }

    try {
        const response = await fetch('http://localhost:8080/api/vouchers/validate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({
                voucher_code: code,
                order_total: subtotal,
                product_variant_ids: variantIds,
                items: cartData && cartData.items
                    ? cartData.items.map(item => ({
                        variant_id: item.variant.product_variant_id,
                        quantity: item.quantity
                    }))
                    : []
            })
        });

        const data = await response.json();

        if (response.ok && data.valid) {
            appliedVoucher = { ...data, voucher_code: code };
            localStorage.setItem('appliedVoucher', JSON.stringify(appliedVoucher));

            msg.style.color = '#28a745';
            let msgText = `✓ Áp dụng thành công! Giảm ${data.discount_percentage}% (-${data.discount_amount.toLocaleString('vi-VN')}đ)`;
            if (data.eligible_product_names && data.eligible_product_names.length > 0) {
                msgText += ` áp dụng cho: ${data.eligible_product_names.join(', ')}`;
            }
            msg.innerText = msgText;
            recalculateCheckoutTotal();
        } else {
            appliedVoucher = null;
            localStorage.removeItem('appliedVoucher');
            msg.style.color = '#d70018';
            const errorMsg = (data.error && data.error.message) || data.message || 'Mã giảm giá không hợp lệ.';
            msg.innerText = errorMsg;
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

// Xóa voucher
window.removeVoucher = function () {
    appliedVoucher = null;
    localStorage.removeItem('appliedVoucher');
    document.getElementById('checkout-coupon-code').value = '';
    document.getElementById('checkout-discount-message').innerText = '';
    recalculateCheckoutTotal();
};

// Điền thông tin user từ API /api/me và lưu vào localStorage
async function fillUserData() {
    const token = localStorage.getItem('accessToken');
    if (!token) return;

    try {
        const response = await fetch('http://localhost:8080/api/me', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            const data = await response.json();
            
            // Đồng bộ sang định dạng currentUser mà frontend mong đợi
            const currentUser = {
                user_id: data.userId,
                username: data.username,
                full_name: data.name,
                phone_number: data.phoneNumber,
                email: data.email
            };
            
            localStorage.setItem('currentUser', JSON.stringify(currentUser));

            const hoTenInput = document.getElementById('ho-ten');
            if (hoTenInput && !hoTenInput.value) hoTenInput.value = currentUser.full_name || currentUser.username || '';
            
            const sdtInput = document.getElementById('so-dien-thoai');
            if (sdtInput && !sdtInput.value) sdtInput.value = currentUser.phone_number || '';
        } else {
            // Fallback sang localStorage hiện có nếu API lỗi
            const userString = localStorage.getItem('currentUser');
            if (userString) {
                const user = JSON.parse(userString);
                const hoTenInput = document.getElementById('ho-ten');
                if (hoTenInput && !hoTenInput.value) hoTenInput.value = user.full_name || user.username || '';
                const sdtInput = document.getElementById('so-dien-thoai');
                if (sdtInput && !sdtInput.value) sdtInput.value = user.phone_number || '';
            }
        }
    } catch (error) {
        console.error('Lỗi khi tải thông tin user:', error);
        // Fallback
        const userString = localStorage.getItem('currentUser');
        if (userString) {
            const user = JSON.parse(userString);
            const hoTenInput = document.getElementById('ho-ten');
            if (hoTenInput && !hoTenInput.value) hoTenInput.value = user.full_name || user.username || '';
            const sdtInput = document.getElementById('so-dien-thoai');
            if (sdtInput && !sdtInput.value) sdtInput.value = user.phone_number || '';
        }
    }
}

// Validate form
function validateCheckoutForm() {
    const hoTen = document.getElementById('ho-ten').value.trim();
    const sdt = document.getElementById('so-dien-thoai').value.trim();
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
        showToast("Lỗi: " + errors.join("\n"), 'error');
        return false;
    }

    return true;
}

// Đặt hàng – gửi POST /api/orders kèm voucher_code
async function xuLyDatHang() {
    if (!validateCheckoutForm()) return;

    if (!cartData || !cartData.items || cartData.items.length === 0) {
        showToast('Giỏ hàng của bạn trống!', 'error');
        return;
    }

    const hoTen = document.getElementById('ho-ten').value.trim();
    const sdt = document.getElementById('so-dien-thoai').value.trim();
    const diaChi = document.getElementById('dia-chi').value.trim();
    const phuongThuc = document.querySelector('input[name="payment"]:checked').value;

    const items = cartData.items.map(item => {
        const orderItem = { quantity: item.quantity };
        if (item.cart_detail_id) {
            orderItem.cart_detail_id = item.cart_detail_id;
        } else if (item.variant && item.variant.product_variant_id) {
            orderItem.product_variant_id = item.variant.product_variant_id;
        }
        return orderItem;
    });

    const orderRequest = {
        receiver_name: hoTen,
        receiver_phone: sdt,
        shipping_address: diaChi,
        payment_method: phuongThuc,
        items: items
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
            localStorage.removeItem('directCheckoutItem');

            window.location.href = 'order-success';
        } else if (response.status === 401) {
            xuLyDangXuat();
            return;
            const errorData = await response.json();
            const errorCode = (errorData.error && errorData.error.code) || errorData.code || '';
            const errorMsg = (errorData.error && errorData.error.message) || errorData.message || 'Đặt hàng thất bại. Vui lòng thử lại!';

            // Nếu lỗi do voucher → xóa voucher và thông báo
            if (errorCode && errorCode.includes('VOUCHER')) {
                appliedVoucher = null;
                localStorage.removeItem('appliedVoucher');
                document.getElementById('checkout-coupon-code').value = '';
                const msg = document.getElementById('checkout-discount-message');
                msg.style.color = '#d70018';
                msg.innerText = errorMsg;
                recalculateCheckoutTotal();
            }
            showToast(errorMsg, 'error');
        }
    } catch (error) {
        console.error('Lỗi:', error);
        showToast('Lỗi kết nối. Vui lòng thử lại sau!', 'error');
    } finally {
        if (btnSubmit) { btnSubmit.disabled = false; btnSubmit.innerText = 'Xác nhận đặt hàng'; }
    }
}
