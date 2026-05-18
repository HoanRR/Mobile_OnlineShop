

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



async function taiDanhSachDonHang(timKiemTuKhoa = '', timKiemTrangThai = '') {
    hienThiDangTai();

    try {
        const accessToken = localStorage.getItem('accessToken');
        
        let url = `http://localhost:8080/api/staff/orders?page=1&limit=100`;
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
        
        danhSachDonHang = result.data || [];
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
    
    danhSachDonHang.forEach(donHang => {
        const maDonHang = donHang.order_id;
        const tenKhachHang = donHang.customerName || donHang.receiver_name || 'Khách lẻ';
        const ngayDat = DinhDangNgay(donHang.order_date);
        const tongTien = DinhDangTien(donHang.total_amount);
        
        // Trạng thái đơn hàng
        const trangThaiKey = donHang.order_status || 'WAIT';
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
                        ${trangThaiKey === 'SHIPPING' ? `
                            <button class="btn-view-detail" style="background-color:#28a745; color:white; border:none;" onclick="chuyenNhanhHoanThanh('${maDonHang}', ${donHang.is_paid})">Hoàn thành</button>
                        ` : ''}
                    </div>
                </td>
            </tr>
        `;
    });

    tbody.innerHTML = html;
}





async function layChiTietDonHangTuAPI(maDonHang) {
    try {
        const accessToken = localStorage.getItem('accessToken') || '';
        
        // Loại bỏ chữ "DH" nếu có để lấy ID số thực sự
        const idSo = String(maDonHang).replace(/\D/g, '');
        
        const response = await fetch(`http://localhost:8080/api/staff/orders/${idSo}`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) return null;
        
        const result = await response.json();
        const chiTiet = result.data || result;
        return chiTiet;
    } catch (loi) {
        console.error('Lỗi lấy chi tiết đơn hàng:', loi);
        return null;
    }
}

async function moModalChiTiet(maDonHang) {
    const modal = document.getElementById('orderDetailModal');
    const content = document.getElementById('orderDetailContent');
    if (!modal || !content) return;

    content.innerHTML = `<div style="text-align:center; padding: 30px;">Đang tải chi tiết...</div>`;
    modal.style.display = 'flex';

    const donHang = await layChiTietDonHangTuAPI(maDonHang);

    if (!donHang) {
        content.innerHTML = `<div style="text-align:center; padding: 30px; color: red;">Không thể tải chi tiết đơn hàng!</div>`;
        return;
    }

    const tenKhachHang = donHang.delivery.receiver_name || 'Khách lẻ';
    const soDienThoai = donHang.delivery.receiver_phone || '-';
    const diaChi = donHang.delivery.shipping_address || 'Nhận tại cửa hàng';
    
    const tongTien = DinhDangTien(donHang.total_amount);
    const giamGia = DinhDangTien(donHang.discount_amount);
    
    const phuongThuc = donHang.payment_method || '-';
    const daThanhToan = donHang.is_paid ? 'Đã thanh toán' : 'Chưa thanh toán';

    const trangThaiKey = donHang.order_status || 'WAIT';
    const thongTinTrangThai = ORDER_STATUSES[trangThaiKey] || ORDER_STATUSES['WAIT'];

    // Render danh sách sản phẩm
    let htmlSanPham = '';
    const danhSachSP = donHang.items || [];
    
    if (danhSachSP.length === 0) {
        htmlSanPham = '<p style="color:#888;">Không có sản phẩm nào.</p>';
    } else {
        danhSachSP.forEach(sp => {
            const tenSP = sp.product_name || 'Sản phẩm';
            const giaSP = DinhDangTien(sp.price_at_purchase || sp.price);
            
            htmlSanPham += `
                        ${sp.imei ? `<br><span style="font-size: 12px; color: #555;">IMEI: ${sp.imei}</span>` : ''}
                        ${sp.device_status ? `
                            <br><span style="font-size: 12px; font-weight:600; color: ${sp.device_status === 'WARRANTY' ? '#ff9800' : sp.device_status === 'RETURNED' ? '#dc3545' : '#28a745'};">
                                Trạng thái: ${sp.device_status === 'WARRANTY' ? 'Đang bảo hành' : sp.device_status === 'RETURNED' ? 'Đã yêu cầu đổi/trả' : 'Bình thường'}
                            </span>
                        ` : ''}
                        ${sp.device_status === 'WARRANTY' ? `
                            <div style="margin-top: 4px;">
                                <button class="btn-view-detail" style="font-size:11px; padding:4px 8px; background-color:#28a745; color:white; border:none;" onclick="xuLyBaoHanhDoiTra('${sp.imei}', 'COMPLETE_WARRANTY', '${maDonHang}')">Hoàn thành bảo hành</button>
                            </div>
                        ` : ''}
                        ${sp.device_status === 'RETURNED' ? `
                            <div style="margin-top: 4px; display:flex; gap: 4px;">
                                <button class="btn-view-detail" style="font-size:11px; padding:4px 8px; background-color:#28a745; color:white; border:none;" onclick="xuLyBaoHanhDoiTra('${sp.imei}', 'CONFIRM_RETURN_GOOD', '${maDonHang}')">Nhận lại kho (Tốt)</button>
                                <button class="btn-view-detail" style="font-size:11px; padding:4px 8px; background-color:#dc3545; color:white; border:none;" onclick="xuLyBaoHanhDoiTra('${sp.imei}', 'CONFIRM_RETURN_DEFECTIVE', '${maDonHang}')">Báo hỏng (Lỗi)</button>
                            </div>
                        ` : ''}
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
            <div><span>Ngày đặt:</span> <strong>${DinhDangNgay(donHang.order_date)}</strong></div>
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
        checkboxThanhToan.checked = (isPaid === true  || trangThaiHienTai === 'DELIVERED');
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
        const accessToken = localStorage.getItem('accessToken') || '';
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
            let errorMsg = `Chuyển trạng thái không hợp lệ`;
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

async function chuyenNhanhHoanThanh(maDonHang, isPaid) {
    if (!confirm('Bạn có chắc chắn muốn hoàn thành đơn hàng này?')) return;

    try {
        const accessToken = localStorage.getItem('accessToken') || '';
        const idSo = String(maDonHang).replace(/\D/g, '');
        
        const response = await fetch(`http://localhost:8080/api/staff/orders/${idSo}/status`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                order_status: 'DELIVERED',
                is_paid: true
            })
        });

        if (!response.ok) {
            let errorMsg = `Không thể hoàn thành đơn hàng`;
            try {
                const errorData = await response.json();
                if (errorData.message) errorMsg = errorData.message;
            } catch (e) {}
            throw new Error(errorMsg);
        }

        alert('Đã hoàn thành đơn hàng!');
        await taiDanhSachDonHang();
    } catch (loi) {
        console.error('Lỗi khi hoàn thành đơn hàng:', loi);
        alert(loi.message || 'Thao tác thất bại. Vui lòng thử lại!');
    }
}

async function xuLyBaoHanhDoiTra(imei, action, maDonHang) {
    let confirmMsg = 'Bạn có chắc chắn muốn thực hiện thao tác này?';
    if (action === 'COMPLETE_WARRANTY') confirmMsg = 'Xác nhận hoàn thành bảo hành cho thiết bị này?';
    if (action === 'CONFIRM_RETURN_GOOD') confirmMsg = 'Xác nhận nhập lại kho thiết bị này?';
    if (action === 'CONFIRM_RETURN_DEFECTIVE') confirmMsg = 'Xác nhận báo hỏng thiết bị này?';

    if (!confirm(confirmMsg)) return;

    try {
        const accessToken = localStorage.getItem('accessToken') || '';
        
        const response = await fetch(`http://localhost:8080/api/staff/orders/process-warranty-return?imei=${imei}&action=${action}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            let errorMsg = `Thao tác thất bại`;
            try {
                const errorData = await response.json();
                if (errorData.message) errorMsg = errorData.message;
            } catch (e) {}
            throw new Error(errorMsg);
        }

        alert('Xử lý thành công!');
        dongModalChiTiet();
        await taiDanhSachDonHang();
    } catch (loi) {
        console.error('Lỗi khi xử lý bảo hành/đổi trả:', loi);
        alert(loi.message || 'Thao tác thất bại. Vui lòng thử lại!');
    }
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
window.chuyenNhanhHoanThanh = chuyenNhanhHoanThanh;
window.xuLyBaoHanhDoiTra = xuLyBaoHanhDoiTra;

// Map tên tiếng Anh từ orders.html sang các hàm tiếng Việt mới refactor
window.closeDetailModal = dongModalChiTiet;
window.closeModal = dongModalTrangThai;
window.saveStatus = luuTrangThaiMoi;