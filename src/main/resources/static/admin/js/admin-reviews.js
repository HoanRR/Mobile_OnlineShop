/**
 * Admin Reviews Page JavaScript
 * Handles staff reply submission, review management, and sidebar toggle
 */

// ========== SIDEBAR & COMMON UI ==========
function initCommonUI() {
  const sidebar = document.getElementById('sidebar');
  const mainContent = document.getElementById('mainContent');
  const toggleBtn = document.getElementById('sidebarToggle');

  if (sidebar && mainContent && toggleBtn) {
    const COLLAPSED_KEY = 'ht_admin_sidebar_collapsed';
    if (localStorage.getItem(COLLAPSED_KEY) === '1') {
      sidebar.classList.add('collapsed');
      mainContent.classList.add('expanded');
    }
    toggleBtn.addEventListener('click', () => {
      const isCollapsed = sidebar.classList.toggle('collapsed');
      mainContent.classList.toggle('expanded', isCollapsed);
      localStorage.setItem(COLLAPSED_KEY, isCollapsed ? '1' : '0');
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

// ========== SUBMIT REPLY FUNCTION ==========
function submitReply(button) {
  const textarea = button.previousElementSibling;
  
  if (!textarea) {
    console.warn('Textarea not found');
    return;
  }

  if (textarea.value.trim() === '') {
    alert('Vui lòng nhập nội dung phản hồi!');
    return;
  }

  const replyText = textarea.value.trim();
  const staffReplySection = button.closest('.staff-reply-section');
  const noiDungChinh = button.closest('.noi-dung-chinh');

  if (!noiDungChinh) {
    console.warn('Review item not found');
    return;
  }

  // Create replied content HTML
  const replyHTML = `
    <div class="replied-content">
      <strong>HT Mobile (Admin) - Vừa xong</strong>
      <p>${replyText}</p>
    </div>
  `;

  // Insert reply and hide reply section
  noiDungChinh.insertAdjacentHTML('beforeend', replyHTML);
  if (staffReplySection) {
    staffReplySection.style.display = 'none';
  }

  alert('Đã gửi phản hồi thành công!');
  console.log('Reply submitted successfully:', replyText);
}

// ========== EDIT PRODUCT HANDLER ==========
function editProduct() {
  alert('Chuyển hướng tới trang chỉnh sửa sản phẩm...');
  // TODO: window.location.href = '/admin/products/edit/1';
}

// ========== HIDE PRODUCT HANDLER ==========
function hideProduct() {
  const btn = document.querySelector('.btn-hide');
  if (!btn) {
    console.warn('Hide button not found');
    return;
  }

  const isHide = confirm("Chú có chắc chắn muốn thay đổi trạng thái hiển thị của sản phẩm này không?");
  if (isHide) {
    if (btn.innerText === "Tạm ẩn sản phẩm") {
      btn.innerText = "Hiển thị lại sản phẩm";
      btn.style.background = "#ef4444";
    } else {
      btn.innerText = "Tạm ẩn sản phẩm";
      btn.style.background = "#6b7280";
    }
    // TODO: fetch('/api/admin/products/:id/hide', { method: 'PUT' })
  }
}

// ========== PAGE INITIALIZATION ==========
document.addEventListener('DOMContentLoaded', () => {
  // Initialize common UI (sidebar toggle, date, logout)
  initCommonUI();

  const editBtn = document.querySelector('.btn-edit');
  const hideBtn = document.querySelector('.btn-hide');

  if (editBtn) {
    editBtn.addEventListener('click', editProduct);
  }

  if (hideBtn) {
    hideBtn.addEventListener('click', hideProduct);
  }

  console.log('Admin reviews page loaded successfully');
});
