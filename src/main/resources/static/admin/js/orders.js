/**
 * Orders page script
 * Handles order list and status management
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
const mockOrders = [
    { order_id: "ORD-1001", customerName: "Nguyễn Văn Quang", created_at: "06/04/2026", total: 29990000, status: "wait" },
    { order_id: "ORD-1002", customerName: "Trần Thị B", created_at: "05/04/2026", total: 15500000, status: "shipping" },
    { order_id: "ORD-1003", customerName: "Lê Hoàng C", created_at: "04/04/2026", total: 33990000, status: "delivery" },
    { order_id: "ORD-1004", customerName: "Phạm Văn D", created_at: "01/04/2026", total: 5400000, status: "returned" }
];

document.addEventListener("DOMContentLoaded", () => {
    initCommonUI();
    
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
    const modal = document.getElementById('statusModal');
    if (modal) {
      modal.style.display = 'flex';
      const modalOrderId = document.getElementById('modalOrderId');
      if (modalOrderId) {
        modalOrderId.innerText = '#' + orderId;
      }
    }
}

function formatCurrency(amount) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    minimumFractionDigits: 0
  }).format(amount);
}
