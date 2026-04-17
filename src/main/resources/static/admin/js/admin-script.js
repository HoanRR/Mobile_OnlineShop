const mockProducts = [
    { id: 1, name: "iPhone 15 Pro Max", brand: "Apple", series: "iPhone 15", price: 29990000, thumbnail: "url_img_1", avg_rating: 4.8 },
    { id: 2, name: "Samsung Galaxy S24 Ultra", brand: "Samsung", series: "Galaxy S", price: 33990000, thumbnail: "url_img_2", avg_rating: 4.7 }
];

const mockOrders = [
    { order_id: "ORD-1001", customerName: "Nguyễn Văn Quang", created_at: "06/04/2026", total: 29990000, status: "wait" },
    { order_id: "ORD-1002", customerName: "Trần Thị B", created_at: "05/04/2026", total: 15500000, status: "shipping" },
    { order_id: "ORD-1003", customerName: "Lê Hoàng C", created_at: "04/04/2026", total: 33990000, status: "delivery" },
    { order_id: "ORD-1004", customerName: "Phạm Văn D", created_at: "01/04/2026", total: 5400000, status: "returned" }
];

const mockStaffs = [
    { id: 1, name: "Huỳnh Trương Thảo Duyên", email: "duyen@htmobile.com", phone: "0901234567", role: "staff", is_active: true },
    { id: 2, name: "Nguyễn Văn Lỗi", email: "loi@htmobile.com", phone: "0988888888", role: "staff", is_active: false }
];

const mockVouchers = [
    { code: "GIAM200K", discount_type: "fixed", discount_value: 200000, min_order_value: 5000000, max_uses: 100, current_uses: 50, expires_at: "2026-04-30" },
    { code: "SIEUSALE", discount_type: "percent", discount_value: 10, min_order_value: 10000000, max_uses: 50, current_uses: 10, expires_at: "2026-05-15" }
];


const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

document.addEventListener("DOMContentLoaded", () => {
    const tableBody = document.querySelector('.admin-table tbody');
    if (!tableBody) return; 

    const currentPage = window.location.href;

    // --- TRANG SẢN PHẨM ---
    if (currentPage.includes("products.html")) {
        tableBody.innerHTML = "";
        mockProducts.forEach(prod => {
            const row = `
                <tr>
                    <td>#${prod.id}</td>
                    <td><strong>${prod.name}</strong></td>
                    <td>${prod.brand}</td>
                    <td style="color: #FF3D00; font-weight: bold;">${formatCurrency(prod.price)}</td>
                    <td>
                        <div class="action-btns">
                            <button class="btn-edit">Sửa</button>
                            <button class="btn-delete">Xóa</button>
                        </div>
                    </td>
                </tr>
            `;
            tableBody.insertAdjacentHTML('beforeend', row);
        });
    }

    // --- TRANG ĐƠN HÀNG ---
    else if (currentPage.includes("orders.html")) {
        tableBody.innerHTML = ""; 
        
        const getStatusBadge = (status) => {
            const map = {
                'wait': '<span class="badge" style="background:#ff9800;color:white;">Chờ xác nhận</span>',
                'confirmed': '<span class="badge" style="background:#03a9f4;color:white;">Đã xác nhận</span>',
                'processing': '<span class="badge" style="background:#9c27b0;color:white;">Đang xử lý</span>',
                'shipping': '<span class="badge" style="background:#2196f3;color:white;">Đang giao</span>',
                'delivery': '<span class="badge" style="background:#4caf50;color:white;">Đã giao</span>',
                'returned': '<span class="badge" style="background:#f44336;color:white;">Hoàn trả</span>'
            };
            return map[status] || status;
        };

        mockOrders.forEach(order => {
            const row = `
                <tr>
                    <td><strong>#${order.order_id}</strong></td>
                    <td>${order.customerName}</td>
                    <td>${order.created_at}</td>
                    <td style="color: #FF3D00; font-weight: bold;">${formatCurrency(order.total)}</td>
                    <td>${getStatusBadge(order.status)}</td>
                    <td>
                        <button class="btn-update-status" onclick="openModal('${order.order_id}')">Cập nhật</button>
                    </td>
                </tr>
            `;
            tableBody.insertAdjacentHTML('beforeend', row);
        });
    }

    // --- TRANG NHÂN VIÊN (USERS) ---
    else if (currentPage.includes("users.html")) {
        tableBody.innerHTML = "";

        mockStaffs.forEach(staff => {
            const statusHtml = staff.is_active 
                ? '<td class="status-active">Hoạt động</td>' 
                : '<td class="status-banned">Bị khóa</td>';

            const actionHtml = staff.is_active
                ? `<button class="btn-edit">Sửa</button> <button class="btn-ban"><i class="fa-solid fa-lock"></i> Khóa</button>`
                : `<button class="btn-edit" style="background-color: #333; color: white; border: 1px solid #555;">Mở khóa</button>`;

            const row = `
                <tr>
                    <td><strong>${staff.name}</strong></td>
                    <td>${staff.email}</td>
                    <td><span class="badge role-staff">Nhân viên</span></td>
                    ${statusHtml}
                    <td>${actionHtml}</td>
                </tr>
            `;
            tableBody.insertAdjacentHTML('beforeend', row);
        });
    }

    // --- TRANG VOUCHERS ---
    else if (currentPage.includes("vouchers.html")) {
        tableBody.innerHTML = "";

        mockVouchers.forEach(v => {
            // Frontend tự xử lý dữ liệu thô thành text hiển thị
            const discountText = v.discount_type === 'fixed' ? formatCurrency(v.discount_value) : `${v.discount_value}%`;
            
            // So sánh ngày để biết còn hạn hay không
            const isExpired = new Date(v.expires_at) < new Date();
            const statusBadge = !isExpired
                ? '<span class="badge badge-active">Đang hoạt động</span>'
                : '<span class="badge badge-expired">Đã hết hạn</span>';

            const row = `
                <tr>
                    <td><strong style="color: #e50000;">${v.code}</strong></td>
                    <td>${discountText}</td>
                    <td>Từ ${formatCurrency(v.min_order_value)}</td>
                    <td>${v.current_uses}/${v.max_uses}</td>
                    <td>${v.expires_at}</td>
                    <td>${statusBadge}</td>
                    <td>
                        <div class="action-btns">
                            <button class="btn-edit">Sửa</button>
                        </div>
                    </td>
                </tr>
            `;
            tableBody.insertAdjacentHTML('beforeend', row);
        });
    }
});