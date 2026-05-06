let selectedItems = [];
let cartData = null;

document.addEventListener("DOMContentLoaded", function () {
    // Check if user is logged in
    const token = localStorage.getItem('accessToken');
    if (!token) {
        alert('Vui lòng đăng nhập để tiếp tục thanh toán!');
        window.location.href = 'login.html';
        return;
    }

    loadCartFromAPI();
    fillUserData();

    const formThanhToan = document.getElementById("form-thanh-toan");
    if (formThanhToan) {
        formThanhToan.addEventListener("submit", function (e) {
            e.preventDefault();
            xuLyDatHang();
        });
    }
});

// Load cart from API
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
            renderCheckoutItems();
        } else if (response.status === 401) {
            // Token expired
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            window.location.href = 'login.html';
        } else {
            alert('Không thể tải giỏ hàng. Vui lòng thử lại!');
        }
    } catch (error) {
        console.error('Lỗi:', error);
        alert('Lỗi kết nối đến máy chủ!');
    }
}

function renderCheckoutItems() {
    if (!cartData || !cartData.items || cartData.items.length === 0) {
        alert("Giỏ hàng của bạn trống!");
        window.location.href = "cart.html";
        return;
    }

    let html = '';
    let total = 0;

    cartData.items.forEach(item => {
        const itemTotal = item.variant.price * item.quantity;
        total += itemTotal;

        html += `
            <div class="checkout-item">
                <img src="${item.variant.image_link}" alt="${item.variant.product_name}" onerror="this.src='https://upload.wikimedia.org/wikipedia/commons/1/14/No_Image_Available.jpg'">
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

    const formattedTotal = total.toLocaleString('vi-VN') + "đ";
    document.getElementById('checkout-subtotal').innerText = formattedTotal;
    document.getElementById('checkout-total').innerText = formattedTotal;
}

// Fill user data from localStorage
function fillUserData() {
    const userString = localStorage.getItem("currentUser");
    if (userString) {
        const user = JSON.parse(userString);
        const hoTenInput = document.getElementById("ho-ten");
        if (hoTenInput && !hoTenInput.value) {
            hoTenInput.value = user.username || '';
        }
    }
}

// Validate form inputs
function validateCheckoutForm() {
    const hoTen = document.getElementById("ho-ten").value.trim();
    const sdt = document.getElementById("so-dien-thoai").value.trim();
    const diaChi = document.getElementById("dia-chi").value.trim();

    let errors = [];

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

// Create order using API
async function xuLyDatHang() {
    if (!validateCheckoutForm()) {
        return;
    }

    const hoTen = document.getElementById("ho-ten").value.trim();
    const sdt = document.getElementById("so-dien-thoai").value.trim();
    const diaChi = document.getElementById("dia-chi").value.trim();
    const ghiChu = document.getElementById("ghi-chu").value.trim();
    const phuongThuc = document.querySelector('input[name="payment"]:checked').value;

    // Build items array from cart
    if (!cartData || !cartData.items || cartData.items.length === 0) {
        alert("Giỏ hàng của bạn trống!");
        return;
    }

    const items = cartData.items.map(item => ({
        cart_detail_id: item.cartDetailId,
        quantity: item.quantity
    }));

    const orderRequest = {
        receiver_name: hoTen,
        receiver_phone: sdt,
        shipping_address: diaChi,
        payment_method: phuongThuc,
        items: items
    };

    // Add note if provided
    if (ghiChu) {
        orderRequest.note = ghiChu;
    }

    try {
        const token = localStorage.getItem('accessToken');

        const response = await fetch('http://localhost:8080/api/orders', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(orderRequest)
        });

        if (response.ok) {
            const orderResponse = await response.json();
            alert('Đặt hàng thành công!');

            // Clear cart from localStorage if it exists
            localStorage.removeItem('cart');
            localStorage.removeItem('appliedCoupon');

            // Redirect to order success page
            window.location.href = "order-success.html";
        } else if (response.status === 401) {
            // Token expired
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            window.location.href = 'login.html';
        } else {
            const errorData = await response.json();
            alert(errorData.message || 'Đặt hàng thất bại. Vui lòng thử lại!');
        }
    } catch (error) {
        console.error('Lỗi:', error);
        alert('Lỗi kết nối. Vui lòng thử lại sau!');
    }
}