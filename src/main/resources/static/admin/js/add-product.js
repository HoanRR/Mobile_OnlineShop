/**
 * Add Product page script
 * Saves products to localStorage while backend APIs are not connected.
 */

const PRODUCTS_STORAGE_KEY = 'ht_products';

const addProductDefaultProducts = [
  { id: 'SP001', name: 'iPhone 15 Pro Max 256GB', brand: 'Apple', price: 29990000, stock: 12 },
  { id: 'SP002', name: 'Samsung Galaxy S24 Ultra', brand: 'Samsung', price: 27990000, stock: 8 },
  { id: 'SP003', name: 'Xiaomi 14 Pro', brand: 'Xiaomi', price: 22500000, stock: 0 }
];

function useAddProductApi() {
  return Boolean(window.HTApi?.isEnabled());
}

function initCommonUI() {
  const sidebar = document.getElementById('sidebar');
  const mainContent = document.getElementById('mainContent');
  const toggleBtn = document.getElementById('sidebarToggle');

  if (sidebar && mainContent && toggleBtn) {
    const collapsedKey = 'ht_sidebar_collapsed';
    if (localStorage.getItem(collapsedKey) === '1') {
      sidebar.classList.add('collapsed');
      mainContent.classList.add('expanded');
    }

    toggleBtn.addEventListener('click', () => {
      const isCollapsed = sidebar.classList.toggle('collapsed');
      mainContent.classList.toggle('expanded', isCollapsed);
      localStorage.setItem(collapsedKey, isCollapsed ? '1' : '0');
    });
  }

  const dateEl = document.getElementById('currentDate');
  if (dateEl) {
    dateEl.textContent = new Date().toLocaleDateString('vi-VN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  const logoutBtn = document.querySelector('.logout a');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', (event) => {
      event.preventDefault();
      localStorage.removeItem('jwt_token');
      localStorage.removeItem('user_role');
      window.location.href = '../login.html';
    });
  }
}

function readProducts() {
  try {
    const raw = localStorage.getItem(PRODUCTS_STORAGE_KEY);
    if (!raw) return [...addProductDefaultProducts];
    const saved = JSON.parse(raw);
    return Array.isArray(saved) ? saved : [...addProductDefaultProducts];
  } catch (error) {
    return [...addProductDefaultProducts];
  }
}

function saveProducts(products) {
  localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(products));
}

function createInputCell(placeholder, type = 'text', field = '') {
  return `<input type="${type}" data-field="${field}" placeholder="${placeholder}" style="width:100%; padding:10px; background:var(--bg); border:1px solid var(--border); color:var(--text); border-radius:6px;">`;
}

function addVariantRow() {
  const tableBody = document.querySelector('#variantTable tbody');
  if (!tableBody) return;

  const row = document.createElement('tr');
  row.innerHTML = `
    <td>${createInputCell('8GB', 'text', 'ram')}</td>
    <td>${createInputCell('256GB', 'text', 'storage_capacity')}</td>
    <td>${createInputCell('Titan', 'text', 'color')}</td>
    <td>${createInputCell('29990000', 'number', 'price')}</td>
    <td>${createInputCell('12', 'number', 'total_available')}</td>
    <td>${createInputCell('https://...', 'url', 'variant_image_link')}</td>
    <td style="text-align:center;"><button type="button" class="btn-delete" data-action="remove-variant"><i class="fa-solid fa-trash"></i></button></td>
  `;
  tableBody.appendChild(row);
}

function getNextProductId(products) {
  const maxNumber = products.reduce((max, product) => {
    const value = Number(String(product.id || '').replace(/\D/g, ''));
    return Number.isNaN(value) ? max : Math.max(max, value);
  }, 0);

  return `SP${String(maxNumber + 1).padStart(3, '0')}`;
}

function collectVariants() {
  const chip = document.getElementById('productChip')?.value.trim() || '';
  const batteryCapacity = document.getElementById('batteryCapacity')?.value.trim() || '';
  const resolution = document.getElementById('resolution')?.value.trim() || '';
  const productImageLink = document.getElementById('productImageLink')?.value.trim() || '';

  return Array.from(document.querySelectorAll('#variantTable tbody tr'))
    .map((row) => {
      const getField = (field) => row.querySelector(`[data-field="${field}"]`)?.value.trim() || '';
      const storageText = getField('storage_capacity');
      return {
        ram: getField('ram'),
        storage: storageText,
        storage_capacity: Number(String(storageText).replace(/\D/g, '')) || 0,
        color: getField('color'),
        price: Number(getField('price')),
        total_available: Number(getField('total_available')) || 0,
        variant_image_link: getField('variant_image_link') || productImageLink,
        battery_capacity: batteryCapacity,
        resolution,
        chip
      };
    })
    .filter((variant) => variant.ram || variant.storage_capacity || variant.storage || variant.color || variant.price);
}

function handleImagePreview() {
  const input = document.getElementById('file-upload');
  const uploadBox = input ? input.closest('div') : null;
  if (!input || !uploadBox) return;

  input.addEventListener('change', () => {
    const file = input.files && input.files[0];
    const label = uploadBox.querySelector('p');
    if (label) {
      label.textContent = file ? file.name : 'B\u1ea5m ch\u1ecdn \u1ea3nh';
    }
  });
}

async function handleProductSubmit(event) {
  event.preventDefault();

  const form = event.currentTarget;
  const productName = document.getElementById('productName');
  const brandSelect = document.getElementById('productBrand');
  const productImageLink = document.getElementById('productImageLink')?.value.trim() || '';
  const name = productName ? productName.value.trim() : '';
  const brand = brandSelect ? brandSelect.value.trim() : '';
  const variants = collectVariants();

  if (!name || !brand) {
    alert('Vui l\u00f2ng nh\u1eadp t\u00ean s\u1ea3n ph\u1ea9m v\u00e0 ch\u1ecdn h\u00e3ng.');
    return;
  }

  if (!variants.length) {
    alert('Vui l\u00f2ng th\u00eam \u00edt nh\u1ea5t m\u1ed9t phi\u00ean b\u1ea3n c\u1ea5u h\u00ecnh.');
    return;
  }

  const invalidVariant = variants.some((variant) => Number.isNaN(variant.price) || variant.price <= 0 || variant.total_available < 0);
  if (invalidVariant) {
    alert('Gi\u00e1 b\u00e1n ph\u1ea3i l\u1edbn h\u01a1n 0 v\u00e0 t\u1ed3n kho kh\u00f4ng \u0111\u01b0\u1ee3c \u00e2m.');
    return;
  }

  const products = readProducts();
  const firstVariant = variants[0];

  const apiPayload = {
    product_name: name,
    brand,
    product_image_link: productImageLink,
    variants
  };

  if (useAddProductApi()) {
    try {
      await HTApi.admin.products.create(apiPayload);
    } catch (error) {
      alert(error.message || 'Không lưu được sản phẩm qua API.');
      return;
    }
  }

  products.unshift({
    id: getNextProductId(products),
    product_name: name,
    name: `${name}${firstVariant.storage ? ` ${firstVariant.storage}` : ''}`.trim(),
    brand,
    product_image_link: productImageLink,
    price: firstVariant.price,
    stock: variants.reduce((sum, variant) => sum + Number(variant.total_available || 0), 0),
    variants
  });

  saveProducts(products);
  alert(useAddProductApi() ? '\u0110\u00e3 g\u1eedi s\u1ea3n ph\u1ea9m l\u00ean API v\u00e0 l\u01b0u b\u1ea3n d\u00f9ng th\u1eed.' : '\u0110\u00e3 l\u01b0u s\u1ea3n ph\u1ea9m v\u00e0o d\u1eef li\u1ec7u d\u00f9ng th\u1eed.');
  form.reset();

  const tableBody = document.querySelector('#variantTable tbody');
  if (tableBody) {
    tableBody.innerHTML = '';
    addVariantRow();
  }

  const uploadLabel = document.querySelector('#file-upload')?.closest('div')?.querySelector('p');
  if (uploadLabel) uploadLabel.textContent = 'B\u1ea5m ch\u1ecdn \u1ea3nh';
}

function initVariantTableEvents() {
  const table = document.getElementById('variantTable');
  if (!table) return;

  table.addEventListener('click', (event) => {
    const button = event.target.closest('button[data-action="remove-variant"], .btn-delete');
    if (!button) return;

    const rows = table.querySelectorAll('tbody tr');
    if (rows.length <= 1) {
      const inputs = button.closest('tr').querySelectorAll('input');
      inputs.forEach((input) => {
        input.value = '';
      });
      return;
    }

    button.closest('tr').remove();
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initCommonUI();
  initVariantTableEvents();
  handleImagePreview();

  const form = document.querySelector('form');
  if (form) form.addEventListener('submit', handleProductSubmit);
});
