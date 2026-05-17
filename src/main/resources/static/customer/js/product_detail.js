
//Hien thi trang chi tiet san pham

import { addToCart } from "./cart.js";

const API_URL = 'http://localhost:8080/api/products/:product_id';
const trangChiTiet = document.querySelector(".wrapper-product-detail")
const urlParams = new URLSearchParams(window.location.search);
const productId = parseInt(urlParams.get("id"));
let activateVariant = null
let currentProduct = null

async function loadProductDetail() {
    if (!productId) {
        alert("Không tìm thấy mã sản phẩm!");
        return;
    }

    const API_URL = `http://localhost:8080/api/products/${productId}`;

    try {
        const response = await fetch(API_URL);

        if (!response.ok) {
            throw new Error("Lỗi khi tải dữ liệu sản phẩm");
        }

        const productDetail = await response.json();

        renderProductDetailToHTML(productDetail);

    } catch (error) {
        console.error("Lỗi:", error);
    }
}

function renderProductDetailToHTML(data) {
    currentProduct = data
    activateVariant = data.variant[0]
    document.getElementById('product-name').innerText = data.product_name;
    document.getElementById('label-detail').innerText = data.brand;
    document.getElementById('header-danh-gia').innerText = `Hỏi đáp & đánh giá ${data.product_name} chính hãng`;
    renderVariantButtons(data.variant);
    renderReviews(data.review);
    
    // Hiển thị mô tả sản phẩm
    const moTaContainer = document.querySelector(".noi-dung-mo-ta");
    if (moTaContainer) {
        moTaContainer.innerHTML = data.description ? `<p>${data.description}</p>` : '<p>Chưa có mô tả chi tiết cho sản phẩm này.</p>';
    }

    updateDynamicUI();


}

function renderVariantButtons(variants) {
    const container = document.getElementById("variant-options")
    container.innerHTML = '';

    variants.forEach(v => {
        const btn = document.createElement('button');
        btn.innerText = `${v.color} - ${v.storageCapacity}GB`;
        btn.className = 'variant-btn';

        if (v.productVariantId === activateVariant.productVariantId) {
            btn.classList.add('active');
        }

        btn.onclick = () => {
            activateVariant = v;
            renderVariantButtons(variants);
            updateDynamicUI();
        };
        container.appendChild(btn);
    });


}


function updateDynamicUI() {
    document.getElementById('product-price').innerText = activateVariant.price.toLocaleString('vi-VN') + 'đ';

    document.getElementById('main-image').src = activateVariant.variantImageLink || currentProduct.product_image_link;
    if (activateVariant.totalAvailable <= 0) {
        document.getElementById("available").innerText = "Hết hàng";

    }
    else {
        document.getElementById("available").innerText = "Còn hàng";

    }

    let thongSo = document.querySelector(".thong-so-ky-thuat");
    if (thongSo && activateVariant) {
        const htmlCard = `
                  <tr><td>Màn hình</td><td>${activateVariant.screenSize || 'N/A'}</td></tr>
                  <tr><td>Chip</td><td>${activateVariant.chip || 'N/A'}</td></tr>
                  <tr><td>Ram</td><td>${activateVariant.ram || 'N/A'}</td></tr>
                  <tr><td>Bộ nhớ</td><td>${activateVariant.storageCapacity || 'N/A'}</td></tr>
                  <tr><td>Camera trước</td><td>${activateVariant.frontCamera || 'N/A'}</td></tr>
                  <tr><td>Camera sau</td><td>${activateVariant.rearCamera || 'N/A'}</td></tr>
                  <tr><td>Sim</td><td>${activateVariant.simCard || 'N/A'}</td></tr>
                  <tr><td>Pin</td><td>${activateVariant.batteryCapacity || 'N/A'}</td></tr>
            `
        thongSo.innerHTML = htmlCard;
    }
}



function renderReviews(reviews) {
    const container = document.querySelector('.danh-sach-binh-luan-mc');
    container.innerHTML = '';
    
    // Thống kê đánh giá
    let totalReviews = reviews ? reviews.length : 0;
    let sumRating = 0;
    let counts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    
    if (totalReviews > 0) {
        reviews.forEach(r => {
            sumRating += r.rating;
            counts[r.rating] = (counts[r.rating] || 0) + 1;
        });
    }
    
    let avgRating = totalReviews > 0 ? (sumRating / totalReviews).toFixed(1) : 0;
    let roundedAvg = Math.round(avgRating) || 0;
    let avgStars = '⭐'.repeat(roundedAvg) + '☆'.repeat(5 - roundedAvg);
    
    // Cập nhật thẻ hiển thị trên cùng
    const ratingEl = document.getElementById('rating');
    if (ratingEl) ratingEl.innerText = `${avgStars} (${totalReviews} đánh giá)`;
    
    // Cập nhật khu vực tổng quan đánh giá
    const diemSoEl = document.querySelector('.diem-so');
    if (diemSoEl) diemSoEl.innerText = `${avgRating}/5`;
    const saoTongEl = document.querySelector('.sao-tong');
    if (saoTongEl) saoTongEl.innerText = avgStars;
    const tongSoDanhGiaEl = document.querySelector('.tong-so-danh-gia');
    if (tongSoDanhGiaEl) tongSoDanhGiaEl.innerText = `${totalReviews} đánh giá`;
    
    const starBars = document.querySelectorAll('.cot-thanh-sao .dong-sao');
    if (starBars.length === 5) {
        for (let i = 5; i >= 1; i--) {
            let row = starBars[5 - i]; // 5 sao ở index 0
            let count = counts[i];
            let percent = totalReviews > 0 ? (count / totalReviews * 100) : 0;
            let phanTramEl = row.querySelector('.phan-tram');
            if (phanTramEl) phanTramEl.style.width = `${percent}%`;
            let countSpan = row.querySelectorAll('span')[1];
            if (countSpan) countSpan.innerText = count;
        }
    }

    if (!reviews || reviews.length === 0) {
        container.innerHTML = '<div style="padding: 20px; text-align: center;">Chưa có đánh giá nào cho sản phẩm này.</div>';
        return;
    }

    reviews.forEach(review => {
        const stars = '⭐'.repeat(review.rating);

        const dateObj = new Date(review.review_date);
        const timeString = `${dateObj.getHours()}:${dateObj.getMinutes().toString().padStart(2, '0')} ${dateObj.getDate()}/${dateObj.getMonth() + 1}/${dateObj.getFullYear()}`;

        let purchasedTag = '';
        if (review.is_purchased) {
            purchasedTag = `<span style="color: #28a745; font-size: 13px; margin-left: 10px; font-weight: bold;">
                ✓ Đã mua: ${review.variant.color} - ${review.variant.storage_capacity}GB
            </span>`;
        }

        const userName = `Khách hàng #${review.user_id}`;

        const htmlItem = `
            <div class="item-binh-luan-mc">
                <div class="noi-dung-chinh">
                    <div class="header-user">
                        <span class="ten" style="font-weight: bold;">${userName}</span>
                        ${purchasedTag}
                    </div>
                    <div class="sao-danh-gia" style="margin: 5px 0;">${stars}</div>
                    <div class="text-binh-luan">${review.comment}</div>
                    <div class="action-binh-luan" style="margin-top: 10px; font-size: 13px; color: #666;">
                        <button class="btn-thich" style="cursor: pointer; border: none; background: none; color: #007bff;">👍 Hữu ích</button>
                        <span class="thoi-gian" style="margin-left: 15px;">${timeString}</span>
                    </div>
                </div>
            </div>
        `;

        container.insertAdjacentHTML('beforeend', htmlItem);
    });
}

window.addEventListener("DOMContentLoaded", () => {
    loadProductDetail();

    // Nút Thêm vào giỏ hàng
    const btn_gio_hang = document.querySelector('.btn-them-gio-hang');
    if (btn_gio_hang) {
        btn_gio_hang.addEventListener('click', () => {
            const quantity = parseInt(document.getElementById('product-quantity').value) || 1;
            addToCart(activateVariant.productVariantId, quantity);
        });
    }

    // Nút Mua ngay → thêm vào giỏ + chuyển thẳng sang checkout
    const btn_mua_ngay = document.querySelector('.btn-mua-ngay');
    if (btn_mua_ngay) {
        btn_mua_ngay.addEventListener('click', async () => {
            const token = localStorage.getItem('accessToken');
            if (!token) {
                showToast('Vui lòng đăng nhập để mua hàng!', 'warning');
                window.location.href = 'login.html';
                return;
            }

            const quantity = parseInt(document.getElementById('product-quantity').value) || 1;

            // Disable nút để tránh click nhiều lần
            btn_mua_ngay.disabled = true;
            btn_mua_ngay.innerText = 'Đang xử lý...';

            try {
                // 1. Thêm vào giỏ hàng
                const addRes = await fetch('http://localhost:8080/api/cart/items', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        product_variant_id: activateVariant.productVariantId,
                        quantity: quantity
                    })
                });

                if (!addRes.ok) {
                    const err = await addRes.json();
                    showToast(err.message || 'Không thể thêm vào giỏ hàng', 'error');
                    return;
                }

                const addedItem = await addRes.json(); // { cart_detail_id, ... }

                // 2. Lấy cart để tìm cart_detail_id của item vừa thêm
                const cartRes = await fetch('http://localhost:8080/api/cart', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (!cartRes.ok) {
                    showToast('Lỗi khi tải giỏ hàng', 'error');
                    return;
                }

                const cartData = await cartRes.json();

                // Tìm item có variant_id = activateVariant.productVariantId (item mới nhất)
                const matchingItems = cartData.items.filter(
                    it => it.variant && it.variant.product_variant_id === activateVariant.productVariantId
                );

                if (matchingItems.length === 0) {
                    showToast('Không tìm thấy sản phẩm trong giỏ hàng', 'error');
                    return;
                }

                // Lấy item mới nhất (cart_detail_id lớn nhất)
                const targetItem = matchingItems.reduce((a, b) =>
                    a.cart_detail_id > b.cart_detail_id ? a : b
                );

                // 3. Lưu item đã chọn vào localStorage rồi chuyển sang checkout
                localStorage.setItem('selectedCheckoutItems', JSON.stringify([String(targetItem.cart_detail_id)]));
                localStorage.removeItem('appliedVoucher');

                window.location.href = 'checkout.html';

            } catch (error) {
                console.error('Lỗi Mua ngay:', error);
                showToast('Lỗi kết nối. Vui lòng thử lại!', 'error');
            } finally {
                btn_mua_ngay.disabled = false;
                btn_mua_ngay.innerText = 'Mua ngay';
            }
        });
    }
});


// if (trangChiTiet) {

//     let danhGiaChiTiet = document.querySelector(".noi-dung-mo-ta");
//     if (danhGiaChiTiet && sanPham) {
//         const htmlCard = `
//                 <p>${sanPham.moTa}</p>
//             `
//         danhGiaChiTiet.innerHTML = htmlCard;
//     }

//     const nutThemVaoGio = document.querySelector('.btn-them-gio-hang');
//     if (nutThemVaoGio && sanPham) {
//         nutThemVaoGio.addEventListener('click', function () {
//             let gioHang = JSON.parse(localStorage.getItem('cart')) || [];

//             const sanPhamDaCo = gioHang.find(item => item.id === sanPham.id);

//             if (sanPhamDaCo) {
//                 sanPhamDaCo.quantity += 1;
//             } else {
//                 gioHang.push({
//                     id: sanPham.id,
//                     ten: sanPham.ten,
//                     giaHienTai: sanPham.giaHienTai,
//                     anh: sanPham.anh,
//                     quantity: 1
//                 });
//             }

//             localStorage.setItem('cart', JSON.stringify(gioHang));
//             alert(`Đã thêm ${sanPham.ten} vào giỏ hàng!`);
//         });
//     }
// }

