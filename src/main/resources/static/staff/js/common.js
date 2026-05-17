

// Danh sách tiêu đề trang tương ứng với từng file HTML
const DANH_SACH_TIEU_DE = {
  'dashboard.html': 'Tổng quan',
  'pos.html': 'POS Bán Hàng',
  'checkout-info.html': 'Thanh toán POS',
  'orders.html': 'Quản lý Đơn hàng',
  'products.html': 'Tra cứu Sản phẩm',
  'warranty.html': 'Tra cứu Bảo hành',
  'reviews.html': 'Quản lý Đánh giá',
  'review-detail.html': 'Chi tiết Đánh giá'
};

document.addEventListener('DOMContentLoaded', async function () {
  await taiGiaoDienChung();
});


async function taiGiaoDienChung() {
  try {
    // Tải Sidebar
    const sidebarContainer = document.getElementById('sidebar-container');
    if (sidebarContainer) {
      const sidebarResponse = await fetch('sidebar.html', { cache: 'no-cache' });
      if (sidebarResponse.ok) {
        sidebarContainer.innerHTML = await sidebarResponse.text();
      }
    }

    //  Tải Header
    const headerContainer = document.getElementById('header-container');
    if (headerContainer) {
      const headerResponse = await fetch('header.html', { cache: 'no-cache' });
      if (headerResponse.ok) {
        headerContainer.innerHTML = await headerResponse.text();
      }
    }

    // Sau khi HTML của sidebar và header đã được nạp vào DOM, gọi các hàm thiết lập giao diện
    lamNoiBatTrangHienTai();
    capNhatTieuDeTrang();

  } catch (error) {
    console.error("Lỗi khi tải giao diện chung:", error);
  }
}

/**
 * Hàm lấy tên file hiện tại (ví dụ: 'orders.html')
 */
function layTenFileHienTai() {
  return window.location.pathname.split('/').pop() || 'dashboard.html';
}

/**
 * Hàm cập nhật tiêu đề trên thanh Header (topbar)
 */
function capNhatTieuDeTrang() {
  const tieuDeElement = document.getElementById('topbarPageTitle');
  if (tieuDeElement) {
    const tenFile = layTenFileHienTai();
    tieuDeElement.textContent = DANH_SACH_TIEU_DE[tenFile] || 'Quản lý';
  }
}




/**
 * Hàm làm nổi bật menu ở Sidebar tương ứng với trang đang mở
 */
function lamNoiBatTrangHienTai() {
  const fileHienTai = layTenFileHienTai();
  const danhSachMenu = document.querySelectorAll('.nav-item');

  danhSachMenu.forEach(menu => {
    // Thuộc tính data-page có thể chứa nhiều file cách nhau bằng dấu phẩy
    const cacTrang = (menu.dataset.page || '').split(',').map(p => p.trim());
    if (cacTrang.includes(fileHienTai)) {
      menu.classList.add('active');
    } else {
      menu.classList.remove('active');
    }
  });
}




function XuLyDangXuat() {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('userInfo');
  
  window.location.href = '../customer/login.html';
}

/**
 * Hàm loại bỏ dấu tiếng Việt để dễ dàng tìm kiếm (Ví dụ: "Hà Nội" -> "ha noi")
 */
function normalizeText(text) {
  return String(text || '')
    .normalize('NFD') // Tách dấu ra khỏi ký tự
    .replace(/[\u0300-\u036f]/g, '') // Xóa các dấu
    .toLowerCase() // Chuyển về chữ thường
    .trim(); // Xóa khoảng trắng 2 đầu
}

/**
 * Hàm định dạng số tiền sang chuẩn VNĐ (Ví dụ: 10000 -> 10.000 ₫)
 */
function formatCurrency(number) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(Number(number) || 0);
}

/**
 * Hàm hiển thị thông báo góc màn hình (Toast Message)
 * @param {string} message - Nội dung thông báo
 * @param {string} type - Loại thông báo ('success', 'error', 'warning')
 */
function showToast(message, type = 'success') {
  // Kiểm tra xem đã có container chứa toast chưa, nếu chưa thì tạo mới
  let toastContainer = document.getElementById('toast-container');
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.id = 'toast-container';
    document.body.appendChild(toastContainer);
  }

  // Tạo phần tử thông báo mới
  const toast = document.createElement('div');
  toast.classList.add('toast-msg', type);
  toast.innerText = message;

  // Đưa thông báo vào vùng chứa trên màn hình
  toastContainer.appendChild(toast);

  // Tự động xóa thông báo sau 3 giây (3000 milliseconds)
  setTimeout(() => {
    toast.classList.add('fade-out'); // Thêm class tạo hiệu ứng mờ dần

    // Đợi hiệu ứng mờ dần chạy xong (400ms) rồi mới xóa DOM hoàn toàn
    setTimeout(() => {
      toast.remove();
    }, 400);
  }, 3000);
}
