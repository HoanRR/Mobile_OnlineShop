// Vouchers page script
const mockVouchers = [
    { code: "GIAM200K", discount_type: "fixed", discount_value: 200000, min_order_value: 5000000, max_uses: 100, current_uses: 50, expires_at: "2026-04-30" },
    { code: "SIEUSALE", discount_type: "percent", discount_value: 10, min_order_value: 10000000, max_uses: 50, current_uses: 10, expires_at: "2026-05-15" }
];

document.addEventListener("DOMContentLoaded", () => {
    const tableBody = document.querySelector('.admin-table tbody');
    if (!tableBody) return;

    tableBody.innerHTML = "";

    mockVouchers.forEach(v => {
        const discountText = v.discount_type === 'fixed' ? formatCurrency(v.discount_value) : `${v.discount_value}%`;
        
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
});

function openVoucherModal() {
    document.getElementById('voucherModal').style.display = 'flex';
}

function closeModal() {
    document.getElementById('voucherModal').style.display = 'none';
}
