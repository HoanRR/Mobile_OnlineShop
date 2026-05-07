/**
 * Add Product page script
 * Handles product form submission and variant management
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

// ========== ADD VARIANT ROW ==========
function addVariantRow() {
  const tb = document.querySelector("#variantTable tbody");
  if (!tb) {
    console.error('Variant table body not found');
    return;
  }
  
  const tr = document.createElement("tr");
  tr.innerHTML = `
    <td><input type="text" placeholder="8GB" style="width:100%; padding:10px; background:var(--bg); border:1px solid var(--border); color:var(--text); border-radius:6px;"></td>
    <td><input type="text" placeholder="256GB" style="width:100%; padding:10px; background:var(--bg); border:1px solid var(--border); color:var(--text); border-radius:6px;"></td>
    <td><input type="text" placeholder="Titan" style="width:100%; padding:10px; background:var(--bg); border:1px solid var(--border); color:var(--text); border-radius:6px;"></td>
    <td><input type="number" placeholder="29990000" style="width:100%; padding:10px; background:var(--bg); border:1px solid var(--border); color:var(--text); border-radius:6px;"></td>
    <td style="text-align: center;"><button type="button" class="btn-delete" onclick="this.closest('tr').remove()"><i class="fa-solid fa-trash"></i></button></td>
  `;
  tb.appendChild(tr);
}

// ========== FORM HANDLING ==========
document.addEventListener("DOMContentLoaded", () => {
  initCommonUI();
  
  const form = document.querySelector('form');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      alert('Sản phẩm đã được thêm thành công!');
      form.reset();
    });
  }
});
