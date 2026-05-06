const validCoupons = {
    "PBL3": 0.1,
    "HTMOBILE": 0.2,
    "GIAM50K": 50000
};

let currentDiscountPercent = 0;
let currentDiscountFixed = 0;
let cartData = null;

document.addEventListener('DOMContentLoaded', function () {
    const token = localStorage.getItem('accessToken');
    if (!token) {
        const container = document.getElementById('cart-items-list');
        container.innerHTML = `<p class="thong-bao-trong">Vui lòng <a href="login.html">đăng nhập</a> để xem giỏ hàng của bạn.</p>`;
        document.querySelector('.cart-header').style.display = 'none';
        document.querySelector('.cart-summary').innerHTML = '<h3>Tóm tắt đơn hàng</h3><p>Giỏ hàng trống</p>';
        return;
    }

    loadCartFromAPI();
});

async function loadCartFromAPI() {
    try {
        const token = localStorage.getItem('accessToken');

        const response = await fetch('http://localhost:8080/api/cart', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
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
        const container = document.getElementById('cart-items-list');
        container.innerHTML = '<p class="thong-bao-trong">Lỗi kết nối. Vui lòng thử lại!</p>';
        document.querySelector('.cart-header').style.display = 'none';
    }
}

function applyDiscount() {
    const code = document.getElementById('coupon-code').value.trim().toUpperCase();
    const msg = document.getElementById('discount-message');

    if (validCoupons[code]) {
        if (validCoupons[code] < 1) {
            currentDiscountPercent = validCoupons[code];
            currentDiscountFixed = 0;
        } else {
            currentDiscountFixed = validCoupons[code];
            currentDiscountPercent = 0;
        }

        msg.style.color = "#28a745";
        msg.innerText = "Áp dụng mã thành công!";
        calculateTotal();
        const couponData = {
            code: code,
            percent: currentDiscountPercent,
            fixed: currentDiscountFixed
        };
        localStorage.setItem('appliedCoupon', JSON.stringify(couponData));
    } else {
        msg.style.color = "#d70018";
        msg.innerText = "Mã giảm giá không hợp lệ.";
        currentDiscountPercent = 0;
        currentDiscountFixed = 0;
        calculateTotal();
    }
}

function calculateTotal() {
    let total = 0;

    if (cartData && cartData.items) {
        cartData.items.forEach(item => {
            total += item.variant.price * item.quantity;
        });
    }

    let discountValue = (total * currentDiscountPercent) + currentDiscountFixed;
    let finalTotal = total - discountValue;
    if (finalTotal < 0) finalTotal = 0;

    const formattedTotal = total.toLocaleString('vi-VN') + "đ";
    document.getElementById('temp-total').innerText = formattedTotal;
    const discountRow = document.querySelector('.discount-line');
    if (discountValue > 0) {
        discountRow.style.display = 'flex';
        document.getElementById('discount-amount').innerText = "-" + discountValue.toLocaleString('vi-VN') + "đ";
    } else {
        discountRow.style.display = 'none';
    }
    document.getElementById('final-total').innerText = finalTotal.toLocaleString('vi-VN') + "đ";
}

function renderCart() {
    const container = document.getElementById('cart-items-list');

    if (!cartData || !cartData.items || cartData.items.length === 0) {
        container.innerHTML = `<p class="thong-bao-trong">Giỏ hàng của bạn đang trống.</p>
                            <p class="thong-bao-trong">Hãy chọn thêm sản phảm để mua sắm nhé</p>`;
        calculateTotal();
        document.querySelector('.cart-header').style.display = 'none';
        return;
    }

    document.querySelector('.cart-header').style.display = 'flex';
    let html = '';

    cartData.items.forEach((item) => {
        const itemTotal = item.variant.price * item.quantity;

        html += `
            <div class="cart-item">
                <input type="checkbox" class="item-checkbox" checked onchange="toggleItemSelection('${item.cartDetailId}', this.checked)">
                <img src="${item.variant.image_link}" alt="${item.variant.product_name}" onerror="this.src='https://upload.wikimedia.org/wikipedia/commons/1/14/No_Image_Available.jpg'">
                <div class="item-info">
                    <h3>${item.variant.product_name}</h3>
                    <p class="item-variant">${item.variant.color} - ${item.variant.storage_capacity}GB</p>
                    <p class="item-price">${item.variant.price.toLocaleString('vi-VN')}đ</p>
                    <button class="btn-remove" onclick="removeCartItem('${item.cartDetailId}')">Xóa khỏi giỏ</button>
                </div>
                <div class="item-quantity">
                    <button onclick="updateQuantity('${item.cartDetailId}', ${item.quantity - 1})">-</button>
                    <span>${item.quantity}</span>
                    <button onclick="updateQuantity('${item.cartDetailId}', ${item.quantity + 1})">+</button>
                </div>
                <div class="item-total">${itemTotal.toLocaleString('vi-VN')}đ</div>
            </div>
        `;
    });

    container.innerHTML = html;
    calculateTotal();
}

async function updateQuantity(cartDetailId, newQuantity) {
    if (newQuantity < 1) {
        alert('Số lượng phải ít nhất là 1');
        return;
    }

    try {
        const token = localStorage.getItem('accessToken');

        const response = await fetch(`http://localhost:8080/api/cart/items/${cartDetailId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                quantity: newQuantity
            })
        });

        if (response.ok) {
            await loadCartFromAPI();
        } else if (response.status === 401) {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            window.location.href = 'login.html';
        } else {
            alert('Không thể cập nhật giỏ hàng. Vui lòng thử lại!');
        }
    } catch (error) {
        console.error('Lỗi:', error);
        alert('Lỗi kết nối. Vui lòng thử lại!');
    }
}

async function removeCartItem(cartDetailId) {
    if (!confirm('Bạn có chắc chắn muốn xóa sản phẩm này khỏi giỏ hàng?')) {
        return;
    }

    try {
        const token = localStorage.getItem('accessToken');

        const response = await fetch(`http://localhost:8080/api/cart/items/${cartDetailId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            await loadCartFromAPI();
        } else if (response.status === 401) {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            window.location.href = 'login.html';
        } else {
            alert('Không thể xóa sản phẩm. Vui lòng thử lại!');
        }
    } catch (error) {
        console.error('Lỗi:', error);
        alert('Lỗi kết nối. Vui lòng thử lại!');
    }
}

function toggleItemSelection(cartDetailId, isSelected) {
    console.log(`Item ${cartDetailId} selected: ${isSelected}`);
}

function toggleSelectAll() {
    const isChecked = document.getElementById('select-all').checked;
    const checkboxes = document.querySelectorAll('.item-checkbox');
    checkboxes.forEach(checkbox => {
        checkbox.checked = isChecked;
    });
}
