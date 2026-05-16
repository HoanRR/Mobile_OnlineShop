/**
 * Shared Staff layout and utilities.
 */

const STAFF_PAGE_TITLES = {
  'pos.html': 'POS Bán Hàng',
  'checkout-info.html': 'Thanh toán POS',
  'orders.html': 'Quản lý Đơn hàng',
  'products.html': 'Tra cứu Sản phẩm',
  'warranty.html': 'Tra cứu Bảo hành',
  'reviews.html': 'Quản lý Đánh giá',
  'review-detail.html': 'Chi tiết Đánh giá'
};

let staffLayoutPromise = null;
let staffSidebarBound = false;

function currentPageFile() {
  return window.location.pathname.split('/').pop() || 'pos.html';
}

function setStaffPageTitle() {
  const titleEl = document.getElementById('topbarPageTitle');
  if (titleEl) titleEl.textContent = STAFF_PAGE_TITLES[currentPageFile()] || 'Staff';
}

async function loadStaffFragment(containerId, fileName) {
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

async function ensureStaffLayout() {
  if (!staffLayoutPromise) {
    staffLayoutPromise = Promise.all([
      loadStaffFragment('sidebar-container', 'sidebar.html'),
      loadStaffFragment('header-container', 'header.html')
    ]).then(() => {
      displayCurrentDate();
      highlightActivePage();
      setupSidebarToggle();
      setupLogout();
      setStaffPageTitle();
    });
  }

  return staffLayoutPromise;
}

function initCommonUI() {
  ensureStaffLayout();
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
  if (staffSidebarBound) return;

  const sidebar = document.getElementById('sidebar');
  const mainContent = document.getElementById('mainContent');
  const toggleBtn = document.getElementById('sidebarToggle');
  if (!sidebar || !mainContent || !toggleBtn) return;

  const collapsedKey = 'ht_staff_sidebar_collapsed';
  if (localStorage.getItem(collapsedKey) === '1') {
    sidebar.classList.add('collapsed');
    mainContent.classList.add('expanded');
  }

  toggleBtn.addEventListener('click', () => {
    const isCollapsed = sidebar.classList.toggle('collapsed');
    mainContent.classList.toggle('expanded', isCollapsed);
    localStorage.setItem(collapsedKey, isCollapsed ? '1' : '0');
  });

  staffSidebarBound = true;
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

function formatCurrency(number) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(Number(number) || 0);
}

document.addEventListener('DOMContentLoaded', initCommonUI);
