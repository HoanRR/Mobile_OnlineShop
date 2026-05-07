/**
 * Products page script
 * Handles product list and management
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
const mockProducts = [
    { id: 1, name: "iPhone 15 Pro Max", brand: "Apple", series: "iPhone 15", price: 29990000, thumbnail: "url_img_1", avg_rating: 4.8 },
    { id: 2, name: "Samsung Galaxy S24 Ultra", brand: "Samsung", series: "Galaxy S", price: 33990000, thumbnail: "url_img_2", avg_rating: 4.7 }
];

document.addEventListener("DOMContentLoaded", () => {
    initCommonUI();
    
    const tableBody = document.querySelector('.admin-table tbody');
    if (!tableBody) return;

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
});

function formatCurrency(amount) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    minimumFractionDigits: 0
  }).format(amount);
}
