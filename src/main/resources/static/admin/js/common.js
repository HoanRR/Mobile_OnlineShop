/**
 * Shared Admin layout and utilities.
 * Loads header/sidebar fragments for Live Server and keeps page scripts focused on data logic.
 */

const ADMIN_PAGE_TITLES = {
  'dashboard.html': 'Tổng quan Admin',
  'products.html': 'Quản lý Sản phẩm',
  'devices.html': 'Kho thiết bị',
  'orders.html': 'Quản lý Đơn hàng',
  'vouchers.html': 'Voucher',
  'users.html': 'Người Dùng',
  'admin-reviews.html': 'Quản lý Đánh giá',
  'admin-review-detail.html': 'Chi tiết Đánh giá',
  'add-product.html': 'Thêm Sản phẩm'
};

let adminLayoutPromise = null;
let adminSidebarBound = false;

function currentPageFile() {
  return window.location.pathname.split('/').pop() || 'dashboard.html';
}

function setAdminPageTitle() {
  const titleEl = document.getElementById('topbarPageTitle');
  if (titleEl) titleEl.textContent = ADMIN_PAGE_TITLES[currentPageFile()] || 'Admin';
}

async function loadAdminFragment(containerId, fileName) {
  const container = document.getElementById(containerId);
  if (!container || container.dataset.loaded === '1') return;

  try {
    const response = await fetch(fileName, { cache: 'no-cache' });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    container.innerHTML = await response.text();
    container.dataset.loaded = '1';
  } catch (error) {
    console.warn(`Không tải được ${fileName}:`, error);
  }
}

async function ensureAdminLayout() {
  if (!adminLayoutPromise) {
    adminLayoutPromise = Promise.all([
      loadAdminFragment('sidebar-container', 'sidebar.html'),
      loadAdminFragment('header-container', 'header.html')
    ]).then(() => {
      displayCurrentDate();
      highlightActivePage();
      setupSidebarToggle();
      setupLogout();
      setAdminPageTitle();
    });
  }

  return adminLayoutPromise;
}

function initCommonUI() {
  ensureAdminLayout();
}

function displayCurrentDate() {
  const dateEl = document.getElementById('currentDate');
  if (!dateEl) return;

  dateEl.textContent = new Date().toLocaleDateString('vi-VN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

function highlightActivePage() {
  const currentFile = currentPageFile();

  document.querySelectorAll('.nav-item').forEach((item) => {
    const pages = (item.dataset.page || '').split(',').map((page) => page.trim());
    item.classList.toggle('active', pages.includes(currentFile));
  });
}

function setupSidebarToggle() {
  if (adminSidebarBound) return;

  const sidebar = document.getElementById('sidebar');
  const mainContent = document.getElementById('mainContent');
  const toggleBtn = document.getElementById('sidebarToggle');
  if (!sidebar || !mainContent || !toggleBtn) return;

  const collapsedKey = 'ht_admin_sidebar_collapsed';
  if (localStorage.getItem(collapsedKey) === '1') {
    sidebar.classList.add('collapsed');
    mainContent.classList.add('expanded');
  }

  toggleBtn.addEventListener('click', () => {
    const isCollapsed = sidebar.classList.toggle('collapsed');
    mainContent.classList.toggle('expanded', isCollapsed);
    localStorage.setItem(collapsedKey, isCollapsed ? '1' : '0');
  });

  adminSidebarBound = true;
}

function clearAuthSession() {
  localStorage.removeItem('jwt_token');
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('user_role');
}

function normalizeText(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

function setupLogout() {
  const logoutBtn = document.querySelector('.logout a');
  if (!logoutBtn || logoutBtn.dataset.bound === '1') return;

  logoutBtn.dataset.bound = '1';
  logoutBtn.addEventListener('click', (event) => {
    event.preventDefault();
    clearAuthSession();
    window.location.href = '../login.html';
  });
}

function formatCurrency(amount) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    minimumFractionDigits: 0
  }).format(Number(amount) || 0);
}

document.addEventListener('DOMContentLoaded', initCommonUI);
