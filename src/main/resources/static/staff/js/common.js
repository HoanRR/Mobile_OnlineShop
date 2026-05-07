/**
 * Common Staff JavaScript - Shared utilities and initialization
 * Handles sidebar, date display, and logout for all pages
 */

// ========== SIDEBAR & COMMON INITIALIZATION ==========
function initCommonUI() {
  const sidebar = document.getElementById('sidebar');
  const mainContent = document.getElementById('mainContent');
  const toggleBtn = document.getElementById('sidebarToggle');

  if (!sidebar || !mainContent || !toggleBtn) {
    console.warn('Sidebar elements not found');
    return;
  }

  const COLLAPSED_KEY = 'ht_sidebar_collapsed';
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

// ========== ACTIVE SIDEBAR LINK ==========
function highlightActivePage() {
  const currentFile = window.location.pathname.split('/').pop() || 'dashboard.html';
  document.querySelectorAll('.nav-item').forEach(item => {
    const link = item.querySelector('a');
    if (link && link.getAttribute('href') === currentFile) {
      document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
      item.classList.add('active');
    }
  });
}

// ========== CURRENT DATE DISPLAY ==========
function displayCurrentDate() {
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
}

// ========== LOGOUT HANDLER ==========
function setupLogout() {
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

// ========== CURRENCY FORMATTER ==========
function formatCurrency(number) {
  return new Intl.NumberFormat('vi-VN', { 
    style: 'currency', 
    currency: 'VND' 
  }).format(number);
}
