/**
 * CHECKOUT-INFO.JS – Trang xác nhận và tạo đơn hàng tại quầy (POS)
 * -----------------------------------------------------------------------
 * Luồng hoạt động:
 *  1. Đọc dữ liệu giỏ hàng từ sessionStorage (được pos.js lưu vào).
 *  2. Hiển thị tóm tắt sản phẩm, voucher, và tổng tiền.
 *  3. Render ô nhập IMEI cho từng thiết bị trong đơn.
 *  4. Khi nhân viên bấm "Xác nhận", gọi API POST /api/staff/orders/offline để tạo đơn thật.
 *  5. Hiển thị modal hóa đơn thành công.
 */

// Key đọc giỏ hàng từ sessionStorage (phải khớp với KEY_GIO_HANG_POS trong pos.js)
const KEY_PENDING_CART = 'ht_pos_pending_cart';

// Dữ liệu giỏ hàng (đọc từ sessionStorage)
let danhSachHang = [];
let soTienGiam = 0;
let thanhTienCuoi = 0;
let maVoucher = null;

/**
 * Hàm khởi tạo – chạy khi trang tải xong
 */
document.addEventListener('DOMContentLoaded', async () => {
  if (typeof taiGiaoDienChung === 'function') await taiGiaoDienChung();

  docGioHangTuSession();
  hienThiTomTatDonHang();
});

/**
 * Đọc dữ liệu giỏ hàng từ sessionStorage
 * pos.js lưu dạng: { items, discount, totalAfterDiscount, voucherId, voucherCode }
 */
function docGioHangTuSession() {
  try {
    const raw = sessionStorage.getItem(KEY_PENDING_CART);
    if (!raw) {
      canhBaoGioHangTrong();
      return;
    }

    const duLieu = JSON.parse(raw);

    
    if (duLieu.items && Array.isArray(duLieu.items)) {
      // Format mới: object
      danhSachHang = duLieu.items;
      soTienGiam = duLieu.discount || 0;
      thanhTienCuoi = duLieu.totalAfterDiscount || 0;
      maVoucher = duLieu.voucherCode || null;
    }

    if (danhSachHang.length === 0) {
      canhBaoGioHangTrong();
    }
  } catch (err) {
    console.error('Lỗi đọc giỏ hàng POS:', err);
    canhBaoGioHangTrong();
  }
}

function canhBaoGioHangTrong() {
  if (typeof showToast === 'function') showToast('Giỏ hàng trống! Đang chuyển về trang POS...', 'warning');
  setTimeout(() => { window.location.href = 'pos.html'; }, 1500);
}

function dinhDangTien(soTien) {
  if (typeof formatCurrency === 'function') return formatCurrency(soTien);
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(soTien) || 0);
}


function hienThiTomTatDonHang() {
  const vungHang = document.getElementById('summaryItems');
  const lbTamTinh = document.getElementById('summarySubtotal');
  const lbGiamGia = document.getElementById('summaryDiscount');
  const lbThanhTien = document.getElementById('summaryTotal');
  const rowGiamGia = document.getElementById('discountRow');
  const voucherRow = document.getElementById('voucher-info-row');
  const voucherText = document.getElementById('voucher-info-text');

  if (!vungHang) return;

  if (danhSachHang.length === 0) {
    vungHang.innerHTML = `<div style="color: var(--muted); text-align: center; padding: 20px;">Chưa có sản phẩm nào.</div>`;
    return;
  }

  // Tính tổng tạm tính
  const tongTamTinh = danhSachHang.reduce((sum, item) => sum + (Number(item.price) || 0) * (Number(item.qty) || 1), 0);
  const tongSauGiam = thanhTienCuoi > 0 ? thanhTienCuoi : Math.max(0, tongTamTinh - soTienGiam);

  // Render từng sản phẩm
  const html = danhSachHang.map(item => {
    const tongDong = (Number(item.price) || 0) * (Number(item.qty) || 1);
    return `
      <div class="summary-item">
        <div class="summary-item-info">
          <div class="summary-item-name">${item.name || 'Sản phẩm'}</div>
          <div class="summary-item-meta">${dinhDangTien(item.price)} × ${item.qty}</div>
        </div>
        <div class="summary-item-price">${dinhDangTien(tongDong)}</div>
      </div>
    `;
  }).join('');

  vungHang.innerHTML = html;

  // Cập nhật số liệu
  if (lbTamTinh) lbTamTinh.textContent = dinhDangTien(tongTamTinh);
  if (lbGiamGia) lbGiamGia.textContent = `- ${dinhDangTien(soTienGiam)}`;
  if (lbThanhTien) lbThanhTien.textContent = dinhDangTien(tongSauGiam);

  // Hiển thị dòng giảm giá nếu có
  if (soTienGiam > 0 && rowGiamGia) {
    rowGiamGia.style.display = 'flex';
  }

  // Hiển thị thông tin voucher nếu có
  if (maVoucher && voucherRow && voucherText) {
    voucherRow.style.display = 'block';
    voucherText.textContent = `Đã áp dụng voucher: ${maVoucher}`;
  }
}


/**
 * Bật/tắt ô địa chỉ dựa theo lựa chọn hình thức nhận hàng
 */
function toggleAddressField() {
  const kieuNhan = document.querySelector('input[name="receiveType"]:checked')?.value;
  const nhomDiaChi = document.getElementById('addressGroup');
  const inputDiaChi = document.getElementById('customerAddress');

  if (nhomDiaChi) nhomDiaChi.style.display = kieuNhan === 'delivery' ? '' : 'none';
  if (inputDiaChi) inputDiaChi.required = (kieuNhan === 'delivery');
}

function thongBaoLoi(msg) {
  if (typeof showToast === 'function') {
    showToast(msg, 'error');
  } else {
    alert(msg);
  }
}

/**
 * Kiểm tra tính hợp lệ của form trước khi gửi
 */
function kiemTraForm() {
  const ten = document.getElementById('customerName').value.trim();
  const sdt = document.getElementById('customerPhone').value.trim();
  const kieuNhan = document.querySelector('input[name="receiveType"]:checked')?.value;
  const diaChi = document.getElementById('customerAddress').value.trim();

  if (!ten) {
    thongBaoLoi('Vui lòng nhập họ tên khách hàng.');
    return false;
  }

  if (!sdt) {
    thongBaoLoi('Vui lòng nhập số điện thoại.');
    return false;
  }

  if (!/^(0|\+84)[0-9]{9}$/.test(sdt)) {
    thongBaoLoi('Số điện thoại không hợp lệ (10 chữ số, bắt đầu bằng 0).');
    return false;
  }

  if (kieuNhan === 'delivery' && !diaChi) {
    thongBaoLoi('Vui lòng nhập địa chỉ giao hàng.');
    return false;
  }

  return true;
}

/**
 * Xử lý tạo đơn hàng khi nhân viên bấm xác nhận
 * Gọi API POST /api/staff/orders/offline
 */
async function xuLyTaodon() {
  console.log('[POS] xuạtaodon called, danhSachHang =', danhSachHang);
  
  if (danhSachHang.length === 0) {
    thongBaoLoi('Giỏ hàng trống!');
    return;
  }

  if (!kiemTraForm()) return;

  const ten = document.getElementById('customerName').value.trim();
  const sdt = document.getElementById('customerPhone').value.trim();
  const kieuNhan = document.querySelector('input[name="receiveType"]:checked')?.value;
  const diaChi = document.getElementById('customerAddress').value.trim();
  const phuongThucTT = document.querySelector('input[name="payment"]:checked')?.value || 'COD';
  const itemsGui = danhSachHang.map(item => ({
    variant_id: Number(item.variantId || item.id), // Backend cần Long, không phải string
    quantity: Number(item.qty || item.soLuong)
  }));

  const bodyGui = {
    receiver_name: ten,
    receiver_phone: sdt,
    shipping_address: kieuNhan === 'delivery' ? diaChi : 'Nhận tại cửa hàng',
    payment_method: phuongThucTT,
    is_paid: true,
    items: itemsGui
  };

  console.log('[POS] Payload gửi lên:', JSON.stringify(bodyGui, null, 2));

  // Disable nút để tránh bấm 2 lần
  const nutXacNhan = document.getElementById('btnConfirmOrder');
  if (nutXacNhan) {
    nutXacNhan.disabled = true;
    nutXacNhan.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Đang xử lý...';
  }

  try {
    const token = localStorage.getItem('accessToken') || localStorage.getItem('jwt_token') || '';

    const response = await fetch('http://localhost:8080/api/staff/orders/offline', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(bodyGui)
    });

    const ketQua = await response.json();
    console.log('[POS] API response:', response.status, ketQua);

    if (response.ok || response.status === 201) {
      // Xóa giỏ hàng session sau khi tạo đơn thành công
      sessionStorage.removeItem(KEY_PENDING_CART);
      // Hiện modal hóa đơn
      hienThiHoaDon(ketQua);
    } else {
      const loi = (ketQua.error && ketQua.error.message)
        || ketQua.message
        || JSON.stringify(ketQua)
        || 'Tạo đơn thất bại. Vui lòng thử lại.';
      thongBaoLoi('Lỗi ' + response.status + ': ' + loi);
    }
  } catch (err) {
    console.error('Lỗi tạo đơn offline:', err);
    thongBaoLoi('Lỗi kết nối máy chủ. Vui lòng thử lại.');
  } finally {
    if (nutXacNhan) {
      nutXacNhan.disabled = false;
      nutXacNhan.innerHTML = '<i class="fa-solid fa-check"></i> Xác nhận thanh toán';
    }
  }
}

/**
 * Render và hiển thị modal hóa đơn sau khi tạo đơn thành công
 */
function hienThiHoaDon(donHang) {
  const modal = document.getElementById('orderSuccessModal');
  const body = document.getElementById('receiptBody');
  const lbOrderId = document.getElementById('receiptOrderId');

  if (!modal || !body) return;

  const madon = donHang.order_id || donHang.id || 'N/A';
  if (lbOrderId) lbOrderId.textContent = `Mã đơn hàng: #${madon}`;

  // Tính lại tổng tiền để hiển thị trên hóa đơn
  const tongTamTinh = danhSachHang.reduce((sum, item) => sum + (Number(item.price) || 0) * (Number(item.qty) || 1), 0);
  const tongSauGiam = thanhTienCuoi > 0 ? thanhTienCuoi : Math.max(0, tongTamTinh - soTienGiam);

  const ten = document.getElementById('customerName').value.trim();
  const sdt = document.getElementById('customerPhone').value.trim();
  const phuongThucTT = document.querySelector('input[name="payment"]:checked')?.value || 'COD';
  const kieuNhan = document.querySelector('input[name="receiveType"]:checked')?.value;
  const diaChi = kieuNhan === 'delivery'
    ? document.getElementById('customerAddress').value.trim()
    : 'Nhận tại cửa hàng';

  const hangHtml = danhSachHang.map(item => {
    const qty = Number(item.qty) || 1;
    const tongDong = (Number(item.price) || 0) * qty;
    return `
      <tr>
        <td>${item.name}</td>
        <td style="text-align:center;">${qty}</td>
        <td style="text-align:right; font-weight:700;">${dinhDangTien(tongDong)}</td>
      </tr>
    `;
  }).join('');

  body.innerHTML = `
    <div class="receipt-meta">
      <div><span>Khách hàng</span><br><strong>${ten}</strong></div>
      <div><span>Số điện thoại</span><br><strong>${sdt}</strong></div>
      <div><span>Ngày tạo</span><br><strong>${new Date().toLocaleDateString('vi-VN')}</strong></div>
      <div><span>Thanh toán</span><br><strong>${phuongThucTT}</strong></div>
      <div><span>Nhận hàng</span><br><strong>${diaChi}</strong></div>
    </div>

    <table class="receipt-table">
      <thead>
        <tr>
          <th>Sản phẩm</th><th>SL</th><th style="text-align:right;">Thành tiền</th>
        </tr>
      </thead>
      <tbody>${hangHtml}</tbody>
    </table>

    <div class="receipt-total">
      <div class="summary-line"><span>Tạm tính</span><strong>${dinhDangTien(tongTamTinh)}</strong></div>
      ${soTienGiam > 0 ? `<div class="summary-line" style="color:#16a34a;"><span>Giảm giá</span><strong>- ${dinhDangTien(soTienGiam)}</strong></div>` : ''}
      <div class="summary-line total"><span>Thành tiền</span><strong>${dinhDangTien(tongSauGiam)}</strong></div>
    </div>
  `;

  modal.style.display = 'flex';
}
