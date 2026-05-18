/**
 * Chức năng tra cứu sản phẩm của nhân viên (Rewrite theo style pos.js)
 * Lấy dữ liệu từ API và hiển thị
 */

document.addEventListener('DOMContentLoaded', async () => {
  if (typeof initCommonUI === 'function') initCommonUI();
  if (typeof displayCurrentDate === 'function') displayCurrentDate();
  if (typeof highlightActivePage === 'function') highlightActivePage();
  if (typeof setupLogout === 'function') setupLogout();
  
  caiDatSuKienTimKiem();
  await taiDanhSachSanPham();
});

async function taiDanhSachSanPham(tuKhoa = '') {
  const tableBody = document.querySelector('.data-table tbody');
  if (!tableBody) return;

  tableBody.innerHTML = `
    <tr>
      <td colspan="5" style="text-align:center; padding:28px;">
        <i class="fa-solid fa-spinner fa-spin"></i> Đang tải dữ liệu...
      </td>
    </tr>
  `;

  try {
    const response = await fetch('http://localhost:8080/api/products?page=1&limit=100');
    if (!response.ok) throw new Error("Lỗi API sản phẩm");

    const ketQua = await response.json();
    let danhSach = ketQua.data || [];

    if (tuKhoa) {
      const tuKhoaThuong = tuKhoa.toLowerCase();
      danhSach = danhSach.filter(sp => {
        const ten = (sp.product_name || '').toLowerCase();
        const brand = (sp.brand || '').toLowerCase();
        const id = (String(sp.product_id)).toLowerCase();
        return ten.includes(tuKhoaThuong) || brand.includes(tuKhoaThuong) || id.includes(tuKhoaThuong);
      });
    }

    // Lấy tồn kho bằng cách lấy tất cả variant của nó và cộng lại
    const danhSachVoiTonKho = await Promise.all(danhSach.map(async (sp) => {
      try {
        const detailRes = await fetch(`http://localhost:8080/api/products/${sp.product_id}`);
        if (detailRes.ok) {
          const detailData = await detailRes.json();
          const data = detailData.data || detailData;
          const variants = data.variant || [];
          const tongTonKho = variants.reduce((sum, vr) => sum + (vr.totalAvailable || 0), 0);
          return { ...sp, tongTonKho };
        }
      } catch (e) {
        console.error("Lỗi lấy chi tiết sp:", sp.product_id, e);
      }
      return { ...sp, tongTonKho: null };
    }));

    hienThiSanPham(danhSachVoiTonKho);
  } catch (error) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="5" style="color:#e74c3c; text-align:center; padding:28px;">
          Lỗi: Không thể tải sản phẩm từ hệ thống.
        </td>
      </tr>
    `;
    console.error(error);
  }
}

function hienThiSanPham(danhSach) {
  const tableBody = document.querySelector('.data-table tbody');
  if (!tableBody) return;

  if (danhSach.length === 0) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="5" style="text-align:center; color:var(--muted); padding:28px;">Không tìm thấy sản phẩm phù hợp</td>
      </tr>
    `;
    return;
  }

  const html = danhSach.map((sp) => {
    const id = sp.product_id;
    const ten = sp.product_name || '-';
    const brand = sp.brand || '-';
    const gia = sp.min_price || 0;
    
    let stockHtml = '<span class="stock-unknown" style="color:#9ca3af;">Chưa có dữ liệu</span>';
    if (sp.tongTonKho !== null && sp.tongTonKho !== undefined) {
      if (sp.tongTonKho > 0) {
        stockHtml = `<span class="stock-available" style="color:#16a34a; font-weight:bold;">${sp.tongTonKho}</span> chiếc`;
      } else {
        stockHtml = '<span class="stock-outofstock" style="color:#ef4444; font-weight:bold;">Hết hàng</span>';
      }
    }

    return `
      <tr>
        <td class="cell-muted">#${id}</td>
        <td><strong>${ten}</strong></td>
        <td><span class="category-badge">${brand}</span></td>
        <td class="price-cell">${dinhDangTienVN(gia)}</td>
        <td>${stockHtml}</td>
      </tr>
    `;
  }).join('');

  tableBody.innerHTML = html;
}

function caiDatSuKienTimKiem() {
  const filterBar = document.querySelector('.filter-bar');
  if (!filterBar) return;
  
  const searchInput = filterBar.querySelector('input');
  const searchButton = filterBar.querySelector('button');
  let thoiGianCho = null;

  if (searchInput) {
    searchInput.addEventListener('input', () => {
      clearTimeout(thoiGianCho);
      thoiGianCho = setTimeout(() => taiDanhSachSanPham(searchInput.value.trim()), 500);
    });

    searchInput.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') {
        clearTimeout(thoiGianCho);
        taiDanhSachSanPham(searchInput.value.trim());
      }
    });
  }

  if (searchButton && searchInput) {
    searchButton.addEventListener('click', () => {
      clearTimeout(thoiGianCho);
      taiDanhSachSanPham(searchInput.value.trim());
    });
  }
}

function dinhDangTienVN(soTien) {
  if (typeof formatCurrency === 'function') return formatCurrency(soTien);
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(soTien) || 0);
}
