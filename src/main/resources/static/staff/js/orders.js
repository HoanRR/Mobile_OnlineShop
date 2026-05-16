// ========================================================
// orders.js – Quản lý đơn hàng (Trang Nhân viên)
// ========================================================

const ORDER_STATUSES = {
    'WAIT': { label: 'Chờ xác nhận', className: 'status-pending' },
    'PROCESSING': { label: 'Đang xử lý', className: 'status-shipping' },
    'SHIPPING': { label: 'Đang giao', className: 'status-shipping' },
    'DELIVERED': { label: 'Hoàn thành', className: 'status-success' },
    'CANCELLED': { label: 'Đã hủy', className: 'status-cancelled' }
};

let danhSachDonHang = [];
let donHangHienTai = null; // Lưu ID đơn hàng đang thao tác


document.addEventListener('DOMContentLoaded', async function () {
    // Gọi hàm tạo UI chung (nếu có trong common.js)
    if (typeof initCommonUI === 'function') {
        initCommonUI();
    }

    ganSuKien();

    // Lấy tham số trên URL để tìm kiếm ngay nếu có (ví dụ: ?q=123)
    apDungTimKiemTuURL();

    // Tải danh sách đơn hàng từ API
    await taiDanhSachDonHang();
});


function DinhDangTien(soTien) {
    if (!soTien) return '0đ';
    return Number(soTien).toLocaleString('vi-VN') + 'đ';
}
// input : 2025-08-01T10:30:00
function DinhDangNgay(chuoiNgay) {
    if (!chuoiNgay) return '-';
    // Cắt lấy phần ngày (YYYY-MM-DD)
    const ngay = chuoiNgay.substring(0, 10);
    const d = new Date(ngay);
    if (isNaN(d)) return chuoiNgay;
    return d.toLocaleDateString('vi-VN');// Chuyen sang dinh dang ngay theo vietnam dd/MM/yyyy
}

// --------------------------------------------------------
// API: Tải và hiển thị đơn hàng
// --------------------------------------------------------
async function taiDanhSachDonHang(timKiemTuKhoa = '', timKiemTrangThai = '') {
    hienThiDangTai();

    try {
        const accessToken = localStorage.getItem('accessToken');
        
        let url = `http://localhost:8080/api/orders?page=1&limit=100`;
        if (timKiemTuKhoa) url += `&keyword=${encodeURIComponent(timKiemTuKhoa)}`; // ma hoa chuoi để có dấu cách , kí tự đặc biệt -> không lỗi
        if (timKiemTrangThai) url += `&order_status=${encodeURIComponent(timKiemTrangThai)}`;

        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) throw new Error(`Lỗi HTTP: ${response.status}`);
        
        const result = await response.json();
        
        // Tùy backend trả về result.data hoặc mảng trực tiếp
        const rawData = result.data || [];
        
        // HTApi có sẵn hàm mapOrder để chuẩn hóa dữ liệu từ backend
        danhSachDonHang = Array.isArray(rawData) ? rawData.map(order => HTApi.mapOrder(order)) : [];

        hienThiBangDonHang();
    } catch (loi) {
        console.error('Lỗi tải đơn hàng:', loi);
        hienThiLoi(loi.message || 'Không thể kết nối đến máy chủ.');
    }
}

function hienThiBangDonHang() {
    const tbody = document.querySelector('.data-table tbody');
    if (!tbody) return;

    if (danhSachDonHang.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" style="text-align:center; padding: 30px; color: #888;">
                    Không có đơn hàng nào
                </td>
            </tr>
        `;
        return;
    }

    let html = '';
    
    // Dùng vòng lặp forEach đơn giản thay vì map().join()
    danhSachDonHang.forEach(donHang => {
        const maDonHang = donHang.order_id || donHang.id;
        const tenKhachHang = donHang.customerName || donHang.receiver_name || 'Khách lẻ';
        const ngayDat = DinhDangNgay(donHang.date || donHang.order_date);
        const tongTien = DinhDangTien(donHang.total_amount || donHang.total);
        
        // Trạng thái đơn hàng
        const trangThaiKey = donHang.order_status || donHang.status || 'WAIT';
        const thongTinTrangThai = ORDER_STATUSES[trangThaiKey] || ORDER_STATUSES['WAIT'];

        html += `
            <tr>
                <td><strong>#${maDonHang}</strong></td>
                <td>${tenKhachHang}</td>
                <td>${ngayDat}</td>
                <td class="price-cell">${tongTien}</td>
                <td><span class="status-badge ${thongTinTrangThai.className}">${thongTinTrangThai.label}</span></td>
                <td>
                    <div class="order-actions">
                        <button class="btn-view-detail" onclick="moModalChiTiet('${maDonHang}')">Chi tiết</button>
                        <button class="btn-update-status" onclick="moModalTrangThai('${maDonHang}', '${trangThaiKey}', ${donHang.is_paid})">Cập nhật</button>
                    </div>
                </td>
            </tr>
        `;
    });

    tbody.innerHTML = html;
}

// --------------------------------------------------------
// Xử lý Giao diện Đang tải / Lỗi
// --------------------------------------------------------
function hienThiDangTai() {
    const tbody = document.querySelector('.data-table tbody');
    if (tbody) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" style="text-align:center; padding: 30px; color: #888;">
                    Đang tải dữ liệu đơn hàng...
                </td>
            </tr>
        `;
    }
}

function hienThiLoi(thongBao) {
    const tbody = document.querySelector('.data-table tbody');
    if (tbody) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" style="text-align:center; padding: 30px; color: red;">
                    Lỗi: ${thongBao}
                    <br><br>
                    <button onclick="taiDanhSachDonHang()">Thử lại</button>
                </td>
            </tr>
        `;
    }
}

// --------------------------------------------------------
// API: Xem chi tiết đơn hàng
// --------------------------------------------------------
async function layChiTietDonHangTuAPI(maDonHang) {
    try {
        const accessToken = localStorage.getItem('accessToken') || localStorage.getItem('access_token') || localStorage.getItem('jwt_token') || '';
        
        // Loại bỏ chữ "DH" nếu có để lấy ID số thực sự
        const idSo = String(maDonHang).replace(/\D/g, '');
        
        const response = await fetch(`http://localhost:8080/api/orders/${idSo}`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) return null;
        
        const result = await response.json();
        const chiTiet = result.data || result;
        return HTApi.mapOrder(chiTiet);
    } catch (loi) {
        console.error('Lỗi lấy chi tiết đơn hàng:', loi);
        return null;
    }
}

async function moModalChiTiet(maDonHang) {
    const modal = document.getElementById('orderDetailModal');
    const content = document.getElementById('orderDetailContent');
    if (!modal || !content) return;

    // Hiển thị UI đang tải
    content.innerHTML = `<div style="text-align:center; padding: 30px;">Đang tải chi tiết...</div>`;
    modal.style.display = 'flex';

    // Gọi API
    const donHang = await layChiTietDonHangTuAPI(maDonHang);

    if (!donHang) {
        content.innerHTML = `<div style="text-align:center; padding: 30px; color: red;">Không thể tải chi tiết đơn hàng!</div>`;
        return;
    }

    const tenKhachHang = donHang.receiver_name || donHang.customerName || 'Khách lẻ';
    const soDienThoai = donHang.receiver_phone || '-';
    const diaChi = donHang.shipping_address || 'Nhận tại cửa hàng';
    
    const tongTien = DinhDangTien(donHang.total_amount || donHang.total);
    const giamGia = DinhDangTien(donHang.discount_amount || donHang.discount);
    
    const phuongThuc = donHang.payment_method || donHang.paymentMethod || '-';
    const daThanhToan = donHang.is_paid ? 'Đã thanh toán' : 'Chưa thanh toán';

    const trangThaiKey = donHang.order_status || donHang.status || 'WAIT';
    const thongTinTrangThai = ORDER_STATUSES[trangThaiKey] || ORDER_STATUSES['WAIT'];

    // Render danh sách sản phẩm
    let htmlSanPham = '';
    const danhSachSP = donHang.items || donHang.order_details || [];
    
    if (danhSachSP.length === 0) {
        htmlSanPham = '<p style="color:#888;">Không có sản phẩm nào.</p>';
    } else {
        danhSachSP.forEach(sp => {
            const tenSP = sp.product_name || sp.productName || 'Sản phẩm';
            const giaSP = DinhDangTien(sp.price_at_purchase || sp.priceAtPurchase || sp.price);
            
            htmlSanPham += `
                <div class="detail-item">
                    <div>
                        <strong>${tenSP}</strong>
                        <span>
                            Màu: ${sp.color || '-'} | Bộ nhớ: ${sp.storage_capacity || sp.storageCapacity || '-'}GB
                        </span>
                        ${sp.imei ? `<br><span style="font-size: 12px; color: #555;">IMEI: ${sp.imei}</span>` : ''}
                    </div>
                    <strong>${giaSP}</strong>
                </div>
            `;
        });
    }

    // Gắn HTML vào modal
    content.innerHTML = `
        <div class="detail-grid">
            <div><span>Mã đơn:</span> <strong>#${maDonHang}</strong></div>
            <div><span>Trạng thái:</span> <strong><span class="status-badge ${thongTinTrangThai.className}">${thongTinTrangThai.label}</span></strong></div>
            <div><span>Ngày đặt:</span> <strong>${DinhDangNgay(donHang.date || donHang.order_date)}</strong></div>
            <div><span>Thanh toán:</span> <strong>${daThanhToan} (${phuongThuc})</strong></div>
            <div><span>Người nhận:</span> <strong>${tenKhachHang}</strong></div>
            <div><span>Số ĐT:</span> <strong>${soDienThoai}</strong></div>
            <div class="detail-full"><span>Địa chỉ:</span> <strong>${diaChi}</strong></div>
        </div>

        <div class="detail-section-title">Sản phẩm trong đơn</div>
        <div class="detail-items">
            ${htmlSanPham}
        </div>

        <div class="detail-total">
            <div><span>Giảm giá:</span> <strong>${giamGia}</strong></div>
            <div><span>Tổng tiền thanh toán:</span> <strong>${tongTien}</strong></div>
        </div>
    `;
}

function dongModalChiTiet() {
    const modal = document.getElementById('orderDetailModal');
    if (modal) modal.style.display = 'none';
}

// --------------------------------------------------------
// UI: Cập nhật trạng thái
// --------------------------------------------------------
function moModalTrangThai(maDonHang, trangThaiHienTai, isPaid) {
    donHangHienTai = maDonHang;

    const modal = document.getElementById('statusModal');
    const theMaDonHang = document.getElementById('modalOrderId');
    const selectTrangThai = document.getElementById('newStatus');
    const checkboxThanhToan = document.getElementById('isPaid');

    if (theMaDonHang) theMaDonHang.innerText = `#${maDonHang}`;
    if (selectTrangThai) selectTrangThai.value = trangThaiHienTai || 'WAIT';
    
    if (checkboxThanhToan) {
        // Nếu truyền vào giá trị true/false hoặc nếu trạng thái là Hoàn thành thì check
        checkboxThanhToan.checked = (isPaid === true || isPaid === 'true' || trangThaiHienTai === 'DELIVERED');
    }

    if (modal) modal.style.display = 'flex';
}

function dongModalTrangThai() {
    const modal = document.getElementById('statusModal');
    if (modal) modal.style.display = 'none';
    donHangHienTai = null;
}

async function luuTrangThaiMoi() {
    const selectTrangThai = document.getElementById('newStatus');
    const checkboxThanhToan = document.getElementById('isPaid');
    
    if (!donHangHienTai || !selectTrangThai) return;

    const trangThaiMoi = selectTrangThai.value;
    const daThanhToanMoi = checkboxThanhToan ? checkboxThanhToan.checked : false;

    try {
        const accessToken = localStorage.getItem('accessToken') || localStorage.getItem('access_token') || localStorage.getItem('jwt_token') || '';
        const idSo = String(donHangHienTai).replace(/\D/g, '');
        
        const response = await fetch(`http://localhost:8080/api/staff/orders/${idSo}/status`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                order_status: trangThaiMoi,
                is_paid: daThanhToanMoi
            })
        });

        if (!response.ok) {
            let errorMsg = `Lỗi HTTP: ${response.status}`;
            try {
                const errorData = await response.json();
                if (errorData.message) errorMsg = errorData.message;
            } catch (e) {}
            throw new Error(errorMsg);
        }

        alert('Cập nhật trạng thái thành công!');
        dongModalTrangThai();
        
        // Tải lại bảng sau khi cập nhật
        await taiDanhSachDonHang();
    } catch (loi) {
        console.error('Lỗi khi cập nhật trạng thái:', loi);
        alert(loi.message || 'Cập nhật thất bại. Vui lòng thử lại!');
    }
}

// --------------------------------------------------------
// Tìm kiếm và Lọc
// --------------------------------------------------------
function ganSuKien() {
    const nutLoc = document.querySelector('.filter-bar button');
    const oTimKiem = document.querySelector('.filter-bar input[type="text"]');
    const oTrangThai = document.querySelector('.filter-bar select');

    // Khi nhấn nút Lọc
    if (nutLoc) {
        nutLoc.addEventListener('click', async function () {
            const tuKhoa = oTimKiem ? oTimKiem.value.trim() : '';
            const trangThai = oTrangThai ? oTrangThai.value : '';
            await taiDanhSachDonHang(tuKhoa, trangThai);
        });
    }

    // Khi nhấn Enter trong ô tìm kiếm
    if (oTimKiem) {
        oTimKiem.addEventListener('keypress', async function (event) {
            if (event.key === 'Enter') {
                const tuKhoa = oTimKiem.value.trim();
                const trangThai = oTrangThai ? oTrangThai.value : '';
                await taiDanhSachDonHang(tuKhoa, trangThai);
            }
        });
    }

    // Đóng Modal khi bấm ra ngoài vùng xám
    const modalChiTiet = document.getElementById('orderDetailModal');
    if (modalChiTiet) {
        modalChiTiet.addEventListener('click', function(event) {
            if (event.target === modalChiTiet) dongModalChiTiet();
        });
    }

    const modalTrangThai = document.getElementById('statusModal');
    if (modalTrangThai) {
        modalTrangThai.addEventListener('click', function(event) {
            if (event.target === modalTrangThai) dongModalTrangThai();
        });
    }
}

function apDungTimKiemTuURL() {
    const params = new URLSearchParams(window.location.search);
    const tuKhoaTrenURL = params.get('q') || '';
    const trangThaiTrenURL = params.get('status') || sessionStorage.getItem('ht_staff_order_filter_status') || '';

    const oTimKiem = document.querySelector('.filter-bar input[type="text"]');
    const oTrangThai = document.querySelector('.filter-bar select');

    if (tuKhoaTrenURL && oTimKiem) {
        oTimKiem.value = tuKhoaTrenURL;
    }

    if (trangThaiTrenURL && oTrangThai) {
        // Tìm xem có option nào hợp lệ không
        oTrangThai.value = trangThaiTrenURL;
    }

    // Xóa session để không bị ảnh hưởng các lần sau
    sessionStorage.removeItem('ht_staff_order_filter_status');
}

// --------------------------------------------------------
// Expose ra Global (để gọi từ HTML onclick)
// --------------------------------------------------------
window.taiDanhSachDonHang = taiDanhSachDonHang;
window.moModalChiTiet = moModalChiTiet;
window.dongModalChiTiet = dongModalChiTiet;
window.moModalTrangThai = moModalTrangThai;
window.dongModalTrangThai = dongModalTrangThai;
window.luuTrangThaiMoi = luuTrangThaiMoi;