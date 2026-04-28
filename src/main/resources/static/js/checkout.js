document.addEventListener("DOMContentLoaded", function () {
    renderCheckoutItems();
    fillUserData();

    const formThanhToan = document.getElementById("form-thanh-toan");
    if (formThanhToan) {
        formThanhToan.addEventListener("submit", function (e) {
            e.preventDefault(); 
            xuLyDatHang();
        });
    }
});

function renderCheckoutItems() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const appliedCoupon = JSON.parse(localStorage.getItem('appliedCoupon')) || null;
    
    const itemsToCheckout = cart.filter(item => item.selected);

    if (itemsToCheckout.length === 0) {
        alert("Bạn chưa chọn sản phẩm nào để thanh toán!");
        window.location.href = "cart.html";
        return;
    }

    let html = '';
    let total = 0;

    itemsToCheckout.forEach(item => {
        const priceNum = parseInt(item.giaHienTai.replace(/\D/g, ''));
        total += priceNum * item.quantity;

        html += `
            <div class="checkout-item">
                <img src="${item.anh}" alt="${item.ten}" onerror="this.src='https://upload.wikimedia.org/wikipedia/commons/1/14/No_Image_Available.jpg'">
                <div class="checkout-item-info">
                    <h4>${item.ten}</h4>
                    <p>${item.giaHienTai}</p>
                </div>
                <div class="checkout-item-qty">x${item.quantity}</div>
            </div>
        `;
    });
    let discountValue = 0;
    if (appliedCoupon) {
        discountValue = (total * appliedCoupon.percent) + appliedCoupon.fixed;
    }
    let finalTotal = total - discountValue;
    document.getElementById('checkout-items-list').innerHTML = html;
    
    const formattedTotal = total.toLocaleString('vi-VN') + "đ";
    document.getElementById('checkout-subtotal').innerText = formattedTotal;
    document.getElementById('checkout-total').innerText = finalTotal.toLocaleString('vi-VN') + "đ";
}

// Nếu user đã đăng nhập, tự động điền tên
function fillUserData() {
    const userString = localStorage.getItem("currentUser");
    if (userString) {
        const user = JSON.parse(userString);
        document.getElementById("ho-ten").value = user.username; 
    }
}

function xuLyDatHang() {
    const hoTen = document.getElementById("ho-ten").value;
    const sdt = document.getElementById("so-dien-thoai").value;
    const diaChi = document.getElementById("dia-chi").value;
    const phuongThuc = document.querySelector('input[name="payment"]:checked').value;

    //  dùng fetch API gọi POST request gửi cục JSON lên Spring Boot

    //Xóa các sản phẩm ĐÃ MUA khỏi giỏ hàng gốc
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    let newCart = cart.filter(item => !item.selected); // Chỉ giữ lại những món chưa mua
    localStorage.setItem('cart', JSON.stringify(newCart));

    window.location.href = "order-success.html";
}