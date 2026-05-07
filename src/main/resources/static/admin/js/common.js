/**
 * Common JavaScript for Admin Dashboard
 * Handles sidebar navigation, date display, and logout
 */

// ========== SIDEBAR COLLAPSE/EXPAND ==========
document.addEventListener('DOMContentLoaded', function() {
  const sidebar = document.getElementById('sidebar');
  const mainContent = document.getElementById('mainContent');
  const toggleBtn = document.getElementById('sidebarToggle');

  if (!sidebar || !mainContent || !toggleBtn) {
    console.warn('Sidebar elements not found');
    return;
  }

  const COLLAPSED_KEY = 'ht_sidebar_collapsed';

  // Load saved state
  if (localStorage.getItem(COLLAPSED_KEY) === '1') {
    sidebar.classList.add('collapsed');
    mainContent.classList.add('expanded');
  }

  // Handle toggle
  toggleBtn.addEventListener('click', () => {
    const isCollapsed = sidebar.classList.toggle('collapsed');
    mainContent.classList.toggle('expanded', isCollapsed);
    localStorage.setItem(COLLAPSED_KEY, isCollapsed ? '1' : '0');
  });
});

// ========== CURRENT DATE DISPLAY ==========
document.addEventListener('DOMContentLoaded', function() {
  const dateEl = document.getElementById('currentDate');
  if (dateEl) {
    const now = new Date();
    dateEl.textContent = now.toLocaleDateString('vi-VN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
});

// ========== LOGOUT HANDLER ==========
document.addEventListener('DOMContentLoaded', function() {
  const logoutBtn = document.querySelector('.logout a');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', (e) => {
      e.preventDefault();
      localStorage.removeItem('jwt_token');
      localStorage.removeItem('user_role');
      window.location.href = '../login.html';
    });
  }
});
