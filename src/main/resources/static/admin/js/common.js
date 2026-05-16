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

function ensureAdminConfirmDialog() {
  let overlay = document.getElementById('adminConfirmOverlay');
  if (overlay) return overlay;

  overlay = document.createElement('div');
  overlay.id = 'adminConfirmOverlay';
  overlay.className = 'admin-confirm-overlay';
  overlay.setAttribute('aria-hidden', 'true');
  overlay.innerHTML = `
    <div class="admin-confirm-dialog" role="dialog" aria-modal="true" aria-labelledby="adminConfirmTitle" aria-describedby="adminConfirmMessage">
      <div class="admin-confirm-header">
        <div class="admin-confirm-icon"><i class="fa-solid fa-circle-exclamation"></i></div>
        <div>
          <h3 class="admin-confirm-title" id="adminConfirmTitle"></h3>
          <p class="admin-confirm-message" id="adminConfirmMessage"></p>
        </div>
      </div>
      <div class="admin-confirm-actions">
        <button type="button" class="admin-confirm-button secondary" data-admin-confirm-cancel>Hủy</button>
        <button type="button" class="admin-confirm-button primary" data-admin-confirm-ok>Đồng ý</button>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);
  return overlay;
}

function showAdminConfirm(options = {}) {
  const overlay = ensureAdminConfirmDialog();
  const dialog = overlay.querySelector('.admin-confirm-dialog');
  const icon = overlay.querySelector('.admin-confirm-icon i');
  const title = overlay.querySelector('#adminConfirmTitle');
  const message = overlay.querySelector('#adminConfirmMessage');
  const cancelButton = overlay.querySelector('[data-admin-confirm-cancel]');
  const okButton = overlay.querySelector('[data-admin-confirm-ok]');

  dialog.dataset.tone = options.tone || 'danger';
  title.textContent = options.title || 'Xác nhận thao tác';
  message.textContent = options.message || '';
  cancelButton.textContent = options.cancelText || 'Hủy';
  okButton.textContent = options.confirmText || 'Đồng ý';
  cancelButton.hidden = Boolean(options.hideCancel);
  icon.className = `fa-solid ${options.icon || 'fa-circle-exclamation'}`;

  return new Promise((resolve) => {
    const close = (result) => {
      overlay.classList.remove('is-visible');
      overlay.setAttribute('aria-hidden', 'true');
      overlay.removeEventListener('click', onOverlayClick);
      cancelButton.removeEventListener('click', onCancel);
      okButton.removeEventListener('click', onConfirm);
      document.removeEventListener('keydown', onKeyDown);
      resolve(result);
    };

    const onCancel = () => close(false);
    const onConfirm = () => close(true);
    const onOverlayClick = (event) => {
      if (event.target === overlay && !options.hideCancel) close(false);
    };
    const onKeyDown = (event) => {
      if (event.key === 'Escape') close(Boolean(options.hideCancel));
      if (event.key === 'Enter') close(true);
    };

    overlay.addEventListener('click', onOverlayClick);
    cancelButton.addEventListener('click', onCancel);
    okButton.addEventListener('click', onConfirm);
    document.addEventListener('keydown', onKeyDown);

    overlay.setAttribute('aria-hidden', 'false');
    requestAnimationFrame(() => {
      overlay.classList.add('is-visible');
      okButton.focus();
    });
  });
}

function showAdminNotice(options = {}) {
  return showAdminConfirm({
    ...options,
    title: options.title || 'Thao tác thành công',
    confirmText: options.confirmText || 'OK',
    tone: options.tone || 'success',
    icon: options.icon || 'fa-circle-check',
    hideCancel: true
  });
}

function showAdminWarning(options = {}) {
  return showAdminNotice({
    ...options,
    title: options.title || 'Cần kiểm tra lại',
    tone: 'warning',
    icon: options.icon || 'fa-triangle-exclamation'
  });
}

function showAdminError(options = {}) {
  return showAdminNotice({
    ...options,
    title: options.title || 'Không thể thực hiện',
    tone: 'danger',
    icon: options.icon || 'fa-circle-exclamation'
  });
}

window.HTAdminCatalog = (() => {
  const PRODUCTS_KEY = 'ht_products';
  const DEVICES_KEY = 'ht_devices';

  function readJson(key, fallback = []) {
    try {
      const value = JSON.parse(localStorage.getItem(key) || 'null');
      return Array.isArray(value) ? value : fallback;
    } catch (error) {
      return fallback;
    }
  }

  function writeJson(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  function normalizedId(value) {
    return String(value ?? '').trim().toUpperCase();
  }

  function numericProductId(product) {
    return String(product.product_id ?? product.productId ?? product.id ?? '').replace(/\D/g, '');
  }

  function generatedVariantId(product, index = 0) {
    const productNumber = numericProductId(product);
    if (productNumber) {
      const base = `PV${1000 + Number(productNumber)}`;
      return index ? `${base}-${index + 1}` : base;
    }
    return `PV-${normalizedId(product.id || product.product_name || product.name || Date.now())}-${index + 1}`;
  }

  function variantId(variant, product, index = 0) {
    return variant.product_variant_id
      ?? variant.productVariantId
      ?? variant.variant_id
      ?? variant.variantId
      ?? variant.id
      ?? generatedVariantId(product, index);
  }

  function storageText(variant = {}) {
    if (variant.storage) return String(variant.storage);
    const storage = variant.storage_capacity ?? variant.storageCapacity ?? '';
    if (!storage) return '';
    return String(storage).match(/[a-zA-Z]/) ? String(storage) : `${storage}GB`;
  }

  function baseProductName(product = {}) {
    return product.product_name || product.productName || product.name || '';
  }

  function ensureProductVariants(product) {
    const sourceVariants = Array.isArray(product.variants) && product.variants.length
      ? product.variants
      : [{
          price: Number(product.price) || 0,
          total_available: Number(product.stock ?? product.total_available ?? product.totalAvailable ?? 0) || 0,
          variant_image_link: product.product_image_link || product.productImageLink || '',
          storage: product.storage || '',
          storage_capacity: product.storage_capacity || product.storageCapacity || '',
          color: product.color || ''
        }];

    return sourceVariants.map((variant, index) => {
      const id = variantId(variant, product, index);
      return {
        ...variant,
        product_variant_id: id,
        productVariantId: id,
        storage: storageText(variant),
        total_available: Number(variant.total_available ?? variant.totalAvailable ?? product.stock ?? 0) || 0,
        price: Number(variant.price ?? product.price ?? 0) || 0
      };
    });
  }

  function normalizeProducts(products = []) {
    return products.map((product) => {
      const variants = ensureProductVariants(product);
      const stock = variants.reduce((sum, variant) => sum + (Number(variant.total_available ?? variant.totalAvailable) || 0), 0);
      const firstVariant = variants[0] || {};
      return {
        ...product,
        id: product.id || (product.product_id ? `SP${product.product_id}` : ''),
        product_name: baseProductName(product),
        name: product.name || baseProductName(product),
        price: Number(product.price ?? firstVariant.price ?? 0) || 0,
        stock,
        variants
      };
    });
  }

  function readProducts(fallback = []) {
    return normalizeProducts(readJson(PRODUCTS_KEY, fallback));
  }

  function writeProducts(products) {
    writeJson(PRODUCTS_KEY, normalizeProducts(products));
  }

  function readDevices(fallback = []) {
    return readJson(DEVICES_KEY, fallback);
  }

  function writeDevices(devices) {
    writeJson(DEVICES_KEY, devices);
  }

  function isSoldDevice(device) {
    return String(device.status || '').toUpperCase() === 'SOLD' || Boolean(device.order_id || device.orderId);
  }

  function deviceVariantId(device) {
    return device.product_variant_id ?? device.productVariantId ?? device.variant_id ?? device.variantId ?? '';
  }

  function buildVariantIndex(products = []) {
    const index = new Map();
    normalizeProducts(products).forEach((product) => {
      product.variants.forEach((variant) => {
        const id = normalizedId(variant.product_variant_id);
        if (!id) return;
        index.set(id, { product, variant });
      });
    });
    return index;
  }

  function findVariant(products, variantIdValue, productName = '') {
    const entry = buildVariantIndex(products).get(normalizedId(variantIdValue));
    if (!entry) return null;

    const expectedName = normalizeText(productName);
    if (expectedName && normalizeText(baseProductName(entry.product)) !== expectedName && normalizeText(entry.product.name) !== expectedName) {
      return null;
    }

    return entry;
  }

  function syncProductsWithDevices(products = [], devices = []) {
    const normalized = normalizeProducts(products);
    const availableByVariant = new Map();

    devices.forEach((device) => {
      if (isSoldDevice(device)) return;
      const id = normalizedId(deviceVariantId(device));
      if (!id) return;
      availableByVariant.set(id, (availableByVariant.get(id) || 0) + 1);
    });

    return normalized.map((product) => {
      const variants = product.variants.map((variant) => {
        const id = normalizedId(variant.product_variant_id);
        const deviceAvailable = availableByVariant.get(id) || 0;
        const declaredAvailable = Number(variant.total_available ?? variant.totalAvailable ?? 0) || 0;
        const totalAvailable = Math.max(declaredAvailable, deviceAvailable);
        return {
          ...variant,
          total_available: totalAvailable,
          totalAvailable: totalAvailable
        };
      });
      return {
        ...product,
        variants,
        stock: variants.reduce((sum, variant) => sum + (Number(variant.total_available) || 0), 0)
      };
    });
  }

  function increaseVariantStock(products, variantIdValue, quantity) {
    const targetId = normalizedId(variantIdValue);
    return normalizeProducts(products).map((product) => {
      const variants = product.variants.map((variant) => {
        if (normalizedId(variant.product_variant_id) !== targetId) return variant;
        const nextTotal = (Number(variant.total_available ?? variant.totalAvailable) || 0) + quantity;
        return { ...variant, total_available: nextTotal, totalAvailable: nextTotal };
      });
      return {
        ...product,
        variants,
        stock: variants.reduce((sum, variant) => sum + (Number(variant.total_available) || 0), 0)
      };
    });
  }

  return {
    readProducts,
    writeProducts,
    readDevices,
    writeDevices,
    normalizeProducts,
    syncProductsWithDevices,
    increaseVariantStock,
    buildVariantIndex,
    findVariant,
    variantId,
    storageText,
    baseProductName,
    isSoldDevice,
    deviceVariantId,
    normalizedId
  };
})();

document.addEventListener('DOMContentLoaded', initCommonUI);
