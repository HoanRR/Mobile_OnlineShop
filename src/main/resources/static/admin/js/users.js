/**
 * Users page script
 * Handles user list and staff management
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
const mockStaffs = [
    { id: 1, name: "Huỳnh Trương Thảo Duyên", email: "duyen@htmobile.com", phone: "0901234567", role: "staff", is_active: true },
    { id: 2, name: "Nguyễn Văn Lỗi", email: "loi@htmobile.com", phone: "0988888888", role: "staff", is_active: false }
];

document.addEventListener("DOMContentLoaded", () => {
    initCommonUI();
    
    const tableBody = document.querySelector('.admin-table tbody');
    if (!tableBody) return;

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
});
