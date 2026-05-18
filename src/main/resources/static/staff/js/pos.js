/**
 * CHỨC NĂNG POS (TẠO ĐƠN HÀNG TẠI QUẦY)
 * - Lấy danh sách sản phẩm trực tiếp từ API (/api/products).
 * - Bấm vào sản phẩm sẽ gọi API chi tiết để lấy Phiên bản (Variant) và số lượng tồn kho.
 * - Lưu giỏ hàng tạm thời trong bộ nhớ RAM (biến mảng gioHang).
 * - Khi bấm Thanh toán, lưu tạm giỏ hàng vào sessionStorage và chuyển trang.
 */

const KEY_GIO_HANG_POS = 'ht_pos_pending_cart';
let gioHang = [];
let giaTriGiamGia = 0; // Số tiền thực tế đã giảm (luôn lưu dạng VNĐ)
let voucherApDung = null; // Lưu thông tin voucher đã áp dụng thành công


document.addEventListener('DOMContentLoaded', async () => {
  if (typeof taiGiaoDienChung === 'function') await taiGiaoDienChung();
  caiDatSuKienTimKiem();
  await taiDanhSachSanPham();
  hienThiGioHang();
});

async function taiDanhSachSanPham(tuKhoa = '') {
  const gridSanPham = document.getElementById('product-grid');
  if (!gridSanPham) return;

  gridSanPham.innerHTML = `
    <div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: var(--muted);">
      <i class="fa-solid fa-spinner fa-spin" style="font-size: 32px; margin-bottom: 12px;"></i>
      <p>Đang tải sản phẩm từ hệ thống...</p>
    </div>
  `;

  try {
    const url = `http://localhost:8080/api/products?page=1&limit=100`;
    const response = await fetch(url);
    if (!response.ok) throw new Error("Lỗi API sản phẩm");

    const ketQua = await response.json();
    let danhSach = ketQua.data || [];
    
    if (tuKhoa) {
      const tuKhoaThuong = tuKhoa.toLowerCase();
      danhSach = danhSach.filter(sp => (sp.product_name || "").toLowerCase().includes(tuKhoaThuong));
    }
    hienThiSanPhamLuuVaoGrid(danhSach);
  } catch (error) {
    gridSanPham.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: #e74c3c;">
        <i class="fa-solid fa-triangle-exclamation" style="font-size: 32px; margin-bottom: 12px;"></i>
        <p>Không thể tải sản phẩm. Vui lòng kiểm tra kết nối mạng.</p>
        <button onclick="taiDanhSachSanPham()" style="margin-top: 10px; padding: 8px 16px;">Thử lại</button>
      </div>
    `;
  }
}

function hienThiSanPhamLuuVaoGrid(danhSach) {
  const gridSanPham = document.getElementById('product-grid');
  if (!gridSanPham) return;

  if (danhSach.length === 0) {
    gridSanPham.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: var(--muted);">
        <i class="fa-solid fa-box-open" style="font-size: 32px; margin-bottom: 12px; opacity: 0.5;"></i>
        <p>Không tìm thấy sản phẩm nào phù hợp.</p>
      </div>
    `;
    return;
  }

  const html = danhSach.map(sp => {
    const id = sp.product_id;
    const ten = sp.product_name || 'Sản phẩm chưa có tên';
    const gia = sp.min_price || 0;
    const hinhAnh = sp.product_image_link || 'https://upload.wikimedia.org/wikipedia/commons/1/14/No_Image_Available.jpg';

    // Đổi onclick gọi hàm hienThiPopupChonPhienBan thay vì thêm thẳng vào giỏ
    return `
      <div class="pos-item" onclick="hienThiPopupChonPhienBan('${id}')">
        <img src="${hinhAnh}" alt="${ten}" onerror="this.src='https://upload.wikimedia.org/wikipedia/commons/1/14/No_Image_Available.jpg'">
        <h4>${ten}</h4>
        <p style="color: #FF3D00; font-weight: bold; margin-top: 8px;">${dinhDangTienVN(gia)}</p>
      </div>
    `;
  }).join('');
  gridSanPham.innerHTML = html;
}

function caiDatSuKienTimKiem() {
  const inputTimKiem = document.querySelector('.pos-search input');
  const nutTimKiem = document.querySelector('.pos-search button');
  let thoiGianCho = null;

  if (inputTimKiem) {
    inputTimKiem.addEventListener('input', () => {
      clearTimeout(thoiGianCho);
      thoiGianCho = setTimeout(() => taiDanhSachSanPham(inputTimKiem.value.trim()), 500);
    });
    inputTimKiem.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        clearTimeout(thoiGianCho);
        taiDanhSachSanPham(inputTimKiem.value.trim());
      }
    });
  }
  if (nutTimKiem && inputTimKiem) {
    nutTimKiem.addEventListener('click', () => {
      clearTimeout(thoiGianCho);
      taiDanhSachSanPham(inputTimKiem.value.trim());
    });
  }
}

/**
 * ==========================================
 * XỬ LÝ POPUP CHỌN VARIANT (PHIÊN BẢN)
 * ==========================================
 */

async function hienThiPopupChonPhienBan(productId) {
  // Tạo overlay mờ đen
  let overlay = document.getElementById('pos-variant-modal');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'pos-variant-modal';
    overlay.style.position = 'fixed';
    overlay.style.top = '0'; overlay.style.left = '0';
    overlay.style.width = '100vw'; overlay.style.height = '100vh';
    overlay.style.backgroundColor = 'rgba(0,0,0,0.5)';
    overlay.style.display = 'flex';
    overlay.style.justifyContent = 'center';
    overlay.style.alignItems = 'center';
    overlay.style.zIndex = '9999';
    document.body.appendChild(overlay);
  }

  overlay.innerHTML = `
    <div style="background: white; padding: 24px; border-radius: 12px; width: 500px; max-width: 90%; box-shadow: 0 4px 24px rgba(0,0,0,0.2);">
      <h3 style="margin-top: 0; margin-bottom: 16px; border-bottom: 1px solid #eee; padding-bottom: 12px;">Đang tải thông tin cấu hình...</h3>
      <div style="text-align: center;"><i class="fa-solid fa-spinner fa-spin" style="font-size: 24px;"></i></div>
      <div style="text-align: right; margin-top: 16px;">
        <button onclick="document.getElementById('pos-variant-modal').remove()" style="padding: 8px 16px; border: 1px solid #ddd; background: white; border-radius: 6px; cursor: pointer;">Đóng</button>
      </div>
    </div>
  `;

  try {
    const response = await fetch(`http://localhost:8080/api/products/${productId}`);
    if (!response.ok) throw new Error("Lỗi tải chi tiết sản phẩm");
    
    const json = await response.json();
    // Xử lý trường hợp API trả về thẳng data hoặc bị bọc trong {"data": ...}
    const data = json.data || json; 
    const tenSpGoc = data.product_name;
    const variants = data.variant || [];

    if (variants.length === 0) {
      overlay.querySelector('div').innerHTML = `
        <h3 style="margin-top: 0; color: #e74c3c;">Lỗi: Sản phẩm không có cấu hình (variant)</h3>
        <button onclick="document.getElementById('pos-variant-modal').remove()" style="padding: 8px 16px; border: 1px solid #ddd; background: white; border-radius: 6px; cursor: pointer; margin-top: 16px;">Đóng</button>
      `;
      return;
    }

    let variantsHtml = `<div style="display: flex; flex-direction: column; gap: 12px; max-height: 60vh; overflow-y: auto; padding-right: 8px;">`;
    variants.forEach(vr => {
      const tonKho = vr.totalAvailable || 0;
      const hetHang = tonKho <= 0;
      let tenDayDu = `${tenSpGoc} - ${vr.ram || ''} ${vr.storageCapacity ? vr.storageCapacity + 'GB' : ''} - ${vr.color || ''}`.replace(/ -  - /g, ' - ').replace(/ - $/g, '').trim();
      
      // Chống lỗi vỡ layout HTML do dấu nháy đơn, nháy kép trong chuỗi
      const tenDayDuEscaped = tenDayDu.replace(/'/g, "\\'").replace(/"/g, "&quot;");

      variantsHtml += `
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px; border: 1px solid ${hetHang ? '#eee' : '#3b82f6'}; border-radius: 8px; background: ${hetHang ? '#f9fafb' : '#f0f9ff'}; opacity: ${hetHang ? '0.6' : '1'};">
          <div>
            <div style="font-weight: bold; font-size: 15px; color: ${hetHang ? '#9ca3af' : '#1f2937'}; margin-bottom: 4px;">${tenDayDu}</div>
            <div style="font-size: 14px; color: #FF3D00; font-weight: bold;">${dinhDangTienVN(vr.price)}</div>
            <div style="font-size: 12px; color: ${hetHang ? 'red' : 'green'}; margin-top: 4px;"><i class="fa-solid fa-box"></i> Kho: ${tonKho} sản phẩm</div>
          </div>
          <button 
            ${hetHang ? 'disabled' : ''} 
            onclick="themVaoGioHang('${vr.productVariantId}', '${tenDayDuEscaped}', ${vr.price}, ${tonKho}); document.getElementById('pos-variant-modal').remove();"
            style="padding: 8px 16px; background: ${hetHang ? '#d1d5db' : '#FF3D00'}; color: white; border: none; border-radius: 6px; cursor: ${hetHang ? 'not-allowed' : 'pointer'}; font-weight: bold;">
            ${hetHang ? 'Hết hàng' : 'Chọn mua'}
          </button>
        </div>
      `;
    });
    variantsHtml += `</div>`;

    overlay.querySelector('div').innerHTML = `
      <h3 style="margin-top: 0; margin-bottom: 16px; border-bottom: 1px solid #eee; padding-bottom: 12px;">Chọn Phiên Bản</h3>
      ${variantsHtml}
      <div style="text-align: right; margin-top: 20px;">
        <button onclick="document.getElementById('pos-variant-modal').remove()" style="padding: 8px 16px; border: 1px solid #ddd; background: white; border-radius: 6px; cursor: pointer;">Đóng lại</button>
      </div>
    `;

  } catch (error) {
    overlay.querySelector('div').innerHTML = `
      <h3 style="margin-top: 0; color: #e74c3c;">Lỗi tải dữ liệu cấu hình</h3>
      <button onclick="document.getElementById('pos-variant-modal').remove()" style="padding: 8px 16px; border: 1px solid #ddd; background: white; border-radius: 6px; cursor: pointer; margin-top: 16px;">Đóng</button>
    `;
  }
}



function themVaoGioHang(variantId, tenDayDu, gia, tonKho) {
  // Convert ID to string for consistency
  const idStr = String(variantId);
  const spTonTai = gioHang.find(item => item.id === idStr);

  if (spTonTai) {
    if (spTonTai.soLuong + 1 > tonKho) {
      if (typeof showToast === 'function') showToast(`Không đủ hàng! Trong kho chỉ còn ${tonKho}`, 'error');
      else alert(`Không đủ hàng! Trong kho chỉ còn ${tonKho}`);
      return;
    }
    spTonTai.soLuong += 1;
  } else {
    gioHang.push({
      id: idStr,
      ten: tenDayDu,
      gia: Number(gia),
      soLuong: 1,
      tonKho: tonKho
    });
  }

  hienThiGioHang();
  if (typeof showToast === 'function') showToast(`Đã thêm vào giỏ`);
}

function xoaKhoiGioHang(viTri) {
  if (viTri >= 0 && viTri < gioHang.length) {
    gioHang.splice(viTri, 1);
    hienThiGioHang();
  }
}

function capNhatSoLuong(viTri, soLuongMoi) {
  if (viTri >= 0 && viTri < gioHang.length) {
    const sl = parseInt(soLuongMoi);
    const tonKho = gioHang[viTri].tonKho;

    if (sl > tonKho) {
      if (typeof showToast === 'function') showToast(`Trong kho chỉ còn ${tonKho} sản phẩm!`, 'error');
      else alert(`Trong kho chỉ còn ${tonKho} sản phẩm!`);
      gioHang[viTri].soLuong = tonKho;
    } else if (sl > 0) {
      gioHang[viTri].soLuong = sl;
    } else {
      gioHang[viTri].soLuong = 1; 
    }
    hienThiGioHang();
  }
}

function hienThiGioHang() {
  const vungGioHang = document.getElementById('cart-items');
  const lbTongSoLuong = document.getElementById('total-qty');
  const lbTamTinh = document.getElementById('subtotal');
  const lbTongTien = document.getElementById('total-price');

  if (!vungGioHang || !lbTongSoLuong || !lbTamTinh || !lbTongTien) return;

  if (gioHang.length === 0) {
    vungGioHang.innerHTML = `
      <div style="color: var(--muted); text-align: center; margin-top: 60px;">
        <i class="fa-solid fa-cart-arrow-down" style="font-size: 48px; margin-bottom: 16px; opacity: 0.5;"></i>
        <p>Chưa có sản phẩm nào</p>
      </div>
    `;
    lbTongSoLuong.textContent = '0';
    lbTamTinh.textContent = '0 ₫';
    lbTongTien.textContent = '0 ₫';
    return;
  }

  let tongSoLuong = 0;
  let tongTien = 0;
  let htmlGioHang = '';

  gioHang.forEach((item, index) => {
    tongSoLuong += item.soLuong;
    tongTien += item.gia * item.soLuong;

    htmlGioHang += `
      <div class="cart-item" style="border-bottom: 1px dashed #eee; padding-bottom: 12px; margin-bottom: 12px;">
        <div class="cart-item-info">
          <div class="cart-item-name" style="font-size: 14px; font-weight: 500;">${item.ten}</div>
          <div class="cart-item-price" style="color: #FF3D00; font-weight: bold; font-size: 14px;">${dinhDangTienVN(item.gia)}</div>
          <div style="font-size: 11px; color: #6b7280; margin-top: 4px;">Kho còn: ${item.tonKho}</div>
        </div>
        <div class="cart-item-qty" style="display: flex; align-items: center; gap: 8px;">
          <input type="number" min="1" max="${item.tonKho}" value="${item.soLuong}" onchange="capNhatSoLuong(${index}, this.value)" style="width: 50px; text-align: center; padding: 4px; border-radius: 4px; border: 1px solid var(--border);">
          <button class="btn-remove" onclick="xoaKhoiGioHang(${index})" style="background: none; border: none; color: #ef5350; cursor: pointer; padding: 5px;">
            <i class="fa-solid fa-trash"></i>
          </button>
        </div>
      </div>
    `;
  });

  vungGioHang.innerHTML = htmlGioHang;
  lbTongSoLuong.textContent = tongSoLuong;
  lbTamTinh.textContent = dinhDangTienVN(tongTien);
  lbTongTien.textContent = dinhDangTienVN(Math.max(0, tongTien - giaTriGiamGia));
}

function checkout() {
  if (gioHang.length === 0) {
    if (typeof showToast === 'function') showToast('Giỏ hàng đang trống!', 'error');
    return;
  }

  const tongTam = gioHang.reduce((sum, item) => sum + item.gia * item.soLuong, 0);
  const thanhTien = Math.max(0, tongTam - giaTriGiamGia);

  const duLieuChuyenTrang = gioHang.map(item => ({
    key: item.id,
    name: item.ten,
    price: item.gia,
    qty: item.soLuong,
    variantId: item.id
  }));

  sessionStorage.setItem(KEY_GIO_HANG_POS, JSON.stringify({
    items: duLieuChuyenTrang,
    discount: giaTriGiamGia,
    totalAfterDiscount: thanhTien,
    voucherId: voucherApDung ? voucherApDung.voucher_id : null,
    voucherCode: voucherApDung ? voucherApDung.voucher_code : null
  }));
  window.location.href = 'checkout-info.html';
}

function dinhDangTienVN(soTien) {
  if (typeof formatCurrency === 'function') return formatCurrency(soTien);
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(soTien) || 0);
}


async function apDungVoucher() {
  const inputVoucher = document.getElementById('input-voucher');
  const voucherResult = document.getElementById('voucher-result');

  if (!inputVoucher || !voucherResult) return;

  const maVoucher = inputVoucher.value.trim().toUpperCase();
  if (!maVoucher) {
    hienThiKetQuaVoucher('Vui lòng nhập mã voucher.', 'error');
    return;
  }

  // Tính tổng tạm tính hiện tại 
  const tongTam = gioHang.reduce((sum, item) => sum + item.gia * item.soLuong, 0);
  if (tongTam === 0) {
    hienThiKetQuaVoucher('Giỏ hàng đang trống, không thể áp dụng voucher.', 'error');
    return;
  }

  // Hiện trạng thái đang kiểm tra
  hienThiKetQuaVoucher('Đang kiểm tra mã voucher...', 'loading');

  try {
    const response = await fetch('http://localhost:8080/api/vouchers/validate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('accessToken') || ''}`
      },
      body: JSON.stringify({
        voucher_code: maVoucher,
        order_total: tongTam
      })
    });

    const ketQua = await response.json();

    if (!response.ok || !ketQua.valid) {
      voucherApDung = null;
      hienThiKetQuaVoucher(ketQua.message || 'Mã voucher không hợp lệ hoặc đã hết hạn.', 'error');
      hienThiGioHang();
      return;
    }

    voucherApDung = ketQua;
    giaTriGiamGia = ketQua.discount_amount || 0;

    hienThiKetQuaVoucher(
      `✓ Áp dụng thành công! Giảm ${dinhDangTienVN(giaTriGiamGia)}`,
      'success'
    );

    // Refresh lại giỏ hàng và thành tiền
    hienThiGioHang();

  } catch (error) {
    console.error('Lỗi kiểm tra voucher:', error);
    hienThiKetQuaVoucher('Không thể kết nối máy chủ để kiểm tra voucher.', 'error');
  }
}

// Hàm tiện ích: hiển thị thông báo kết quả voucher
function hienThiKetQuaVoucher(noiDung, trangThai) {
  const voucherResult = document.getElementById('voucher-result');
  if (!voucherResult) return;

  const mauSac = {
    success: '#16a34a',
    error: '#dc2626',
    loading: '#6b7280'
  };

  voucherResult.style.display = 'block';
  voucherResult.style.color = mauSac[trangThai] || '#6b7280';
  voucherResult.textContent = noiDung;
}

// Hủy bỏ voucher đã áp dụng
function huyVoucher() {
  voucherApDung = null;
  giaTriGiamGia = 0;
  const inputVoucher = document.getElementById('input-voucher');
  if (inputVoucher) inputVoucher.value = '';
  hienThiKetQuaVoucher('Đã hủy voucher.', 'error');
  hienThiGioHang();
}
