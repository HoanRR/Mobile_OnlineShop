let danhSachSanPham = [];
let thongTinSanPham = null;
let danhSachDanhGia = [];

// ============================================================================
// CÁC HÀM TIỆN ÍCH CHUNG
// ============================================================================


function layIdTuUrl() {
  const params = new URLSearchParams(window.location.search);
  const rawId = params.get('id');
  if (!rawId) return '';
  // Hỗ trợ cả định dạng "SP001" và "1"
  return String(rawId).replace(/^SP/i, '').replace(/\D/g, '') || rawId;
}

function taoSao(diem) {
  const soSao = Math.max(1, Math.min(5, Math.round(Number(diem) || 5)));
  return '⭐'.repeat(soSao);
}
// "2025-08-01T14:30:00"
function DinhDangNgay(chuoiNgay) {
  if (!chuoiNgay) return '';
  try {
    const date = new Date(chuoiNgay);
    return date.toLocaleDateString('vi-VN', {
      hour: '2-digit', minute: '2-digit',
      day: '2-digit', month: '2-digit', year: 'numeric'
    });
  } catch (e) {
    return chuoiNgay;
  }
}




async function taiDanhSachSanPham(tuKhoa = '') {
  const tableBody = document.querySelector('.admin-table tbody');
  if (!tableBody) return;

  tableBody.innerHTML = `
        <tr>
            <td colspan="6" style="text-align:center; padding:32px; color:var(--muted);">
                <i class="fa-solid fa-spinner fa-spin" style="font-size:24px; margin-bottom:8px; display:block;"></i>
                Đang tải danh sách sản phẩm...
            </td>
        </tr>
    `;

  try {
    let url = `http://localhost:8080/api/products?page=1&limit=100`;
    if (tuKhoa) {
      url += `&keyword=${encodeURIComponent(tuKhoa)}`;
    }

    const response = await fetch(url);
    if (!response.ok) throw new Error('Không thể tải dữ liệu sản phẩm');

    const result = await response.json();
    danhSachSanPham = result.data.filter(sp => (sp.avg_rating || 0) > 0) || [];

    hienThiBangDanhGia();
  } catch (loi) {
    console.error('Lỗi tải danh sách sản phẩm:', loi);
    tableBody.innerHTML = `
            <tr>
                <td colspan="6" style="text-align:center; color:red; padding:32px;">Lỗi: ${loi.message}</td>
            </tr>
        `;
  }
}

function hienThiBangDanhGia() {
  const tableBody = document.querySelector('.admin-table tbody');
  if (!tableBody) return;

  // Lấy thông tin bộ lọc
  const boLocSao = document.querySelector('.filter-bar select');
  const cheDoLoc = boLocSao ? boLocSao.value : '';

  // Lọc danh sách theo số sao
  let dsHienThi = danhSachSanPham;
  if (cheDoLoc.includes('Dưới 3')) {
    dsHienThi = danhSachSanPham.filter(sp => (sp.avg_rating || 0) < 3);
  } else if (cheDoLoc.includes('Từ 4')) {
    dsHienThi = danhSachSanPham.filter(sp => (sp.avg_rating || 0) >= 4);
  }

  if (dsHienThi.length === 0) {
    tableBody.innerHTML = `
            <tr>
                <td colspan="6" style="text-align:center; color:var(--muted); padding:32px;">Không tìm thấy sản phẩm phù hợp</td>
            </tr>
        `;
    return;
  }

  tableBody.innerHTML = dsHienThi.map(sp => {
    const id = sp.product_id || '';
    const ten = sp.product_name || 'Sản phẩm không tên';
    const diemTb = Number(sp.avg_rating || 0).toFixed(1);
    const tongDanhGia = sp.total_reviews || 0;

    return `
            <tr>
                <td style="color:var(--muted);">#${id}</td>
                <td style="color:var(--text); font-weight:500;">${ten}</td>
                <td><span style="color:#f59e0b; font-weight:bold;">${diemTb} <i class="fa-solid fa-star"></i></span></td>
                <td style="color:var(--text);">${tongDanhGia} lượt</td>
                <td style="color:var(--muted); font-size:13px;">${DinhDangNgay(sp.latest_review_date) || '-'}</td>
                <td><a href="review-detail.html?id=${id}" class="btn-edit" style="text-decoration:none; display:inline-block;">Xem chi tiết</a></td>
            </tr>
        `;
  }).join('');
}



// TRANG CHI TIẾT
async function taiChiTietDanhGia() {
  const listDanhGia = document.querySelector('.reviews-list');
  if (!listDanhGia) return; 

  const idSanPham = layIdTuUrl();
  if (!idSanPham) {
    listDanhGia.innerHTML = `<div style="text-align:center; padding:32px; color:red;">Không tìm thấy mã sản phẩm.</div>`;
    return;
  }

  try {
    // Tải thông tin tổng quan sản phẩm
    const resSp = await fetch(`http://localhost:8080/api/products/${idSanPham}`);
    if (resSp.ok) {
      thongTinSanPham = await resSp.json();
      hienThiThongTinSanPham(thongTinSanPham);
    }

    // Tải danh sách đánh giá của sản phẩm đó
    const resReviews = await fetch(`http://localhost:8080/api/products/${idSanPham}/reviews?limit=100`);
    if (resReviews.ok) {
      const dataReviews = await resReviews.json();
      danhSachDanhGia = dataReviews.reviews || [];

      if (dataReviews.avg_rating !== undefined && thongTinSanPham) {
        thongTinSanPham.avg_rating = dataReviews.avg_rating;
        thongTinSanPham.total_reviews = dataReviews.total_reviews;
        hienThiThongTinSanPham(thongTinSanPham);
      }

      hienThiDanhSachDanhGia();
    } else {
      throw new Error('Không thể tải đánh giá');
    }
  } catch (loi) {
    console.error('Lỗi tải chi tiết đánh giá:', loi);
    listDanhGia.innerHTML = `<div style="text-align:center; padding:32px; color:red;">Lỗi: ${loi.message}</div>`;
  }
}

function hienThiThongTinSanPham(sp) {
  const theTen = document.querySelector('.product-info-panel h2');
  const theSao = document.querySelector('.product-rating-stars');
  const theTongSo = document.querySelector('.product-rating-count');
  const theGia = document.querySelector('.product-price');
  const theTonKho = document.querySelector('.product-stock');

  if (theTen) theTen.textContent = sp.product_name || 'Sản phẩm không tên';
  if (theSao) theSao.textContent = taoSao(sp.avg_rating || 0);
  if (theTongSo) theTongSo.textContent = `(${sp.total_reviews || 0} đánh giá)`;



  if (theTonKho) {
    let tonKho = 0;
    sp.variant.forEach(v => {
      tonKho += (v.totalAvailable || 0);
    });
    theTonKho.textContent = `Tồn kho: ${tonKho} máy`;
  }
}

function hienThiDanhSachDanhGia() {
  const listDanhGia = document.querySelector('.reviews-list');
  if (!listDanhGia) return;

  if (danhSachDanhGia.length === 0) {
    listDanhGia.innerHTML = `<div style="text-align:center; padding:32px; color:var(--muted);">Chưa có đánh giá nào cho sản phẩm này.</div>`;
    return;
  }

  listDanhGia.innerHTML = danhSachDanhGia.map(dg => {
    // Nếu đã có phản hồi từ nhân viên
    const htmlPhanHoiCu = dg.staff_reply ? `
            <div class="replied-content">
                <div class="replied-content-header">HT Mobile (Nhân Viên) - ${DinhDangNgay(dg.reply_date)}</div>
                <p class="replied-content-text">${dg.staff_reply || ''}</p>
            </div>
        ` : '';

    // Nếu chưa có phản hồi thì hiện ô nhập
    const htmlOPhanHoi = dg.staff_reply ? '' : `
            <div class="reply-section">
                <div class="reply-box">
                    <textarea placeholder="Nhập câu trả lời cho khách hàng ${dg.username || 'Khách hàng'}..."></textarea>
                    <button class="btn-submit-reply" data-review-id="${dg.product_review_id || dg.id}" onclick="guiPhanHoi(this)">Gửi phản hồi</button>
                </div>
            </div>
        `;

    return `
            <div class="review-item">
                <div class="review-item-header">
                    <div class="review-item-user">
                        <div class="review-item-name">${dg.username || 'Khách hàng'}</div>
                    </div>
                    <span class="review-item-rating">${taoSao(dg.rating)}</span>
                </div>
                <div class="review-item-content">${dg.comment || ''}</div>
                <div class="review-item-time">${DinhDangNgay(dg.review_date)}</div>
                ${htmlPhanHoiCu}
                ${htmlOPhanHoi}
            </div>
        `;
  }).join('');
}


async function guiPhanHoi(nutBam) {
  const oNhap = nutBam.previousElementSibling; // lay phan tu phia truoc nut bam (Cung trong 1 DOM)
  const noiDungPhanHoi = oNhap ? oNhap.value.trim() : '';

  if (!noiDungPhanHoi) {
    if (oNhap) oNhap.focus();
    return;
  }

  const idDanhGia = nutBam.getAttribute('data-review-id');
  if (!idDanhGia) {
    alert("Không tìm thấy ID đánh giá!");
    return;
  }

  const btnOldText = nutBam.innerText;
  nutBam.innerText = "Đang gửi...";
  nutBam.disabled = true;

  try {
    const token = localStorage.getItem('accessToken') || '';
    const response = await fetch(`http://localhost:8080/api/staff/reviews/${idDanhGia}/reply`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ reply: noiDungPhanHoi })
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.message || "Lỗi khi gửi phản hồi");
    }

    const dataThanhCong = await response.json();

    // Tạo HTML phản hồi mới
    const htmlPhanHoiMoi = `
            <div class="replied-content">
                <div class="replied-content-header">HT Mobile (Nhân Viên) - ${DinhDangNgay(dataThanhCong.reply_date || new Date().toISOString())}</div>
                <p class="replied-content-text">${dataThanhCong.staff_reply || noiDungPhanHoi || ''}</p>
            </div>
        `;

    // Chèn vào giao diện
    const theReviewItem = nutBam.closest('.review-item');
    const theThoiGianDanhGia = theReviewItem.querySelector('.review-item-time');
    const vungPhanHoi = nutBam.closest('.reply-section');

    if (theThoiGianDanhGia) {
      theThoiGianDanhGia.insertAdjacentHTML('afterend', htmlPhanHoiMoi);
    }

    // Ẩn ô nhập sau khi gửi xong
    if (vungPhanHoi) vungPhanHoi.style.display = 'none';

    showToast("Gửi phản hồi thành công!");

  } catch (loi) {
    console.error("Lỗi:", loi);
    alert(loi.message || "Đã xảy ra lỗi khi gửi phản hồi!");
    nutBam.innerText = btnOldText;
    nutBam.disabled = false;
  }
}

// ============================================================================
// KHỞI TẠO SỰ KIỆN KHI TRANG TẢI XONG
// ============================================================================

document.addEventListener('DOMContentLoaded', async () => {
  // Kế thừa các hàm UI chung (nếu có trong common.js)
  if (typeof initCommonUI === 'function') initCommonUI();
  if (typeof highlightActivePage === 'function') highlightActivePage();

  // Lắng nghe sự kiện nút "Lọc" ở trang reviews.html
  const nutLoc = document.querySelector('.filter-bar button');
  const oTimKiem = document.querySelector('.filter-bar input');
  const boLocSao = document.querySelector('.filter-bar select');

  if (nutLoc) {
    nutLoc.addEventListener('click', () => {
      const tuKhoa = oTimKiem ? oTimKiem.value.trim() : '';
      taiDanhSachSanPham(tuKhoa);
    });
  }

  if (oTimKiem) {
    oTimKiem.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        taiDanhSachSanPham(oTimKiem.value.trim());
      }
    });
  }

  // Nếu người dùng chọn bộ lọc Sao, tự động lọc danh sách nội bộ luôn
  if (boLocSao) {
    boLocSao.addEventListener('change', () => {
      hienThiBangDanhGia();
    });
  }

  // Tự động tải dữ liệu tùy theo trang hiện tại
  await taiDanhSachSanPham();
  await taiChiTietDanhGia();
});

// Expose ra Global (để gọi từ HTML onclick)
window.guiPhanHoi = guiPhanHoi;
window.taiDanhSachSanPham = taiDanhSachSanPham;
window.taiChiTietDanhGia = taiChiTietDanhGia;
