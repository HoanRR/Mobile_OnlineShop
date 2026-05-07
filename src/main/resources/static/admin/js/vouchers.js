/**
 * Vouchers page script
 * Handles voucher list and management
 */

// ========== SIDEBAR & COMMON ==========
function initCommonUI() {
  const sidebar = document.getElementById('sidebar');
  const mainContent = document.getElementById('mainContent');
  const toggleBtn = document.getElementById('sidebarToggle');

  if (sidebar && mainContent && toggleBtn) {
    const COLLAPSED_KEY = 'ht_sidebar_collapsed';
    if (localStorage.getItem(COLLAPSED_KEY) === '1') {
      sidebar.classList.add('collapsed');
      mainContent.classList.add('expanded');
    }
    toggleBtn.addEventListener('click', () => {
      const isC = sidebar.classList.toggle('collapsed');
      mainContent.classList.toggle('expanded', isC);
      localStorage.setItem(COLLAPSED_KEY, isC ? '1' : '0');
    });
  }

  const dateEl = document.getElementById('currentDate');
  if (dateEl) {
    const now = new Date();
    dateEl.textContent = now.toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  }

  const logoutBtn = document.querySelector('.logout a');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', (e) => {
      e.preventDefault();
      localStorage.removeItem('jwt_token');
      localStorage.removeItem('user_role');
      window.location.href = '../login.html';
    });
  }
}

// ========== MOCK DATA ==========
const mockVouchers = [
    { code: "GIAM200K", discount_type: "fixed", discount_value: 200000, min_order_value: 5000000, max_uses: 100, current_uses: 50, expires_at: "2026-04-30" },
    { code: "SIEUSALE", discount_type: "percent", discount_value: 10, min_order_value: 10000000, max_uses: 50, current_uses: 10, expires_at: "2026-05-15" }
];

document.addEventListener("DOMContentLoaded", () => {
    initCommonUI();
    
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
    const modal = document.getElementById('voucherModal');
    if (modal) {
      modal.style.display = 'flex';
    }
}

function closeModal() {
    const modal = document.getElementById('voucherModal');
    if (modal) {
      modal.style.display = 'none';
    }
}

function formatCurrency(amount) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    minimumFractionDigits: 0
  }).format(amount);
}
