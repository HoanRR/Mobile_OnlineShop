// Orders page script
const mockOrders = [
    { order_id: "ORD-1001", customerName: "Nguyễn Văn Quang", created_at: "06/04/2026", total: 29990000, status: "wait" },
    { order_id: "ORD-1002", customerName: "Trần Thị B", created_at: "05/04/2026", total: 15500000, status: "shipping" },
    { order_id: "ORD-1003", customerName: "Lê Hoàng C", created_at: "04/04/2026", total: 33990000, status: "delivery" },
    { order_id: "ORD-1004", customerName: "Phạm Văn D", created_at: "01/04/2026", total: 5400000, status: "returned" }
];

document.addEventListener("DOMContentLoaded", () => {
    const tableBody = document.querySelector('.admin-table tbody');
    if (!tableBody) return;

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
});

function openModal(orderId) {
    alert('Cập nhật trạng thái đơn hàng ' + orderId);
}
