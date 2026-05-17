/**
 * Products page script
 * Mock product lookup/edit/delete while backend APIs are not connected.
 */

const PRODUCTS_STORAGE_KEY = 'ht_products';

const defaultProducts = [
  { id: 'SP001', name: 'iPhone 15 Pro Max 256GB', brand: 'Apple', price: 29990000, stock: 12 },
  { id: 'SP002', name: 'Samsung Galaxy S24 Ultra', brand: 'Samsung', price: 27990000, stock: 8 },
  { id: 'SP003', name: 'Xiaomi 14 Pro', brand: 'Xiaomi', price: 22500000, stock: 0 }
];

let products = [];
let productsApiError = '';

function useProductsApi() {
  return Boolean(window.HTApi?.isEnabled());
}

function escapeHtml(value) {
  const div = document.createElement('div');
  div.textContent = value ?? '';
  return div.innerHTML;
}

async function loadProducts(query = {}) {
  productsApiError = '';

  if (useProductsApi()) {
    try {
      const response = await HTApi.products.listWithDetails({ page: 1, limit: 100, ...query });
      products = HTApi.listData(response).map(HTApi.mapProduct);
      return;
    } catch (error) {
      productsApiError = error.message || 'Kh\u00f4ng l\u1ea5y \u0111\u01b0\u1ee3c s\u1ea3n ph\u1ea9m t\u1eeb API.';
      console.warn('Không lấy được sản phẩm từ API, dùng dữ liệu mock.', error);
    }
  }

  products = HTAdminCatalog.syncProductsWithDevices(
    HTAdminCatalog.readProducts(defaultProducts),
    HTAdminCatalog.readDevices([])
  );
  saveProducts();
}

function saveProducts() {
  HTAdminCatalog.writeProducts(products);
}

function apiProductId(product) {
  return product.product_id || product.productId || String(product.id || '').replace(/\D/g, '');
}

function getFilteredProducts() {
  const input = document.querySelector('.filter-bar input');
  const keyword = normalizeText(input ? input.value : '');

  if (!keyword) return products;

  return products.filter((product) => {
    return normalizeText(product.id).includes(keyword.replace(/^#/, ''))
      || normalizeText(product.name).includes(keyword)
      || normalizeText(product.product_name).includes(keyword)
      || normalizeText(product.brand).includes(keyword);
  });
}

function stockText(product) {
  if (product.stock_known === false) {
    return '<span style="color:var(--muted); font-weight:600;">Ch\u01b0a c\u00f3 d\u1eef li\u1ec7u</span>';
  }

  const stock = Number(product.stock) || 0;
  if (stock <= 0) {
    return '<span style="color:#ef4444; font-weight:600;">H\u1ebft h\u00e0ng</span>';
  }

  return `<span style="color:var(--green); font-weight:600;">${stock} chi\u1ebfc</span>`;
}

function productBaseName(product) {
  return product.product_name || product.productName || product.name || '';
}

function productVariants(product) {
  if (Array.isArray(product.variants) && product.variants.length) return product.variants;

  return [{
    ram: product.ram || '',
    storage: product.storage || '',
    storage_capacity: product.storage_capacity || product.storageCapacity || '',
    color: product.color || '',
    price: Number(product.price) || 0,
    total_available: Number(product.stock) || 0,
    variant_image_link: product.variant_image_link || product.product_image_link || ''
  }];
}

function variantStorageText(variant) {
  if (variant.storage) return variant.storage;
  const storage = variant.storage_capacity ?? variant.storageCapacity ?? '';
  if (!storage) return '';
  return String(storage).match(/[a-zA-Z]/) ? String(storage) : `${storage}GB`;
}

function renderProducts() {
  const tableBody = document.querySelector('.admin-table tbody');
  if (!tableBody) return;

  const filteredProducts = getFilteredProducts();
  const warningRow = productsApiError
    ? `
      <tr>
        <td colspan="6" style="color:#f59e0b; background:rgba(245,158,11,0.08);">
          API /api/products l\u1ed7i: ${escapeHtml(productsApiError)}. \u0110ang hi\u1ec3n th\u1ecb d\u1eef li\u1ec7u mock.
        </td>
      </tr>
    `
    : '';

  if (!filteredProducts.length) {
    tableBody.innerHTML = `
      ${warningRow}
      <tr>
        <td colspan="6" style="text-align:center; color:var(--muted); padding:28px;">Kh\u00f4ng t\u00ecm th\u1ea5y s\u1ea3n ph\u1ea9m ph\u00f9 h\u1ee3p</td>
      </tr>
    `;
    return;
  }

  const rows = filteredProducts.map((product) => `
    <tr>
      <td style="color:var(--muted);">#${escapeHtml(product.id)}</td>
      <td style="color:var(--text); font-weight:500;">${escapeHtml(product.name)}</td>
      <td><span style="background:rgba(255,255,255,0.1); padding:4px 10px; border-radius:6px; font-size:12px;">${escapeHtml(product.brand || '-')}</span></td>
      <td style="color:#FF3D00; font-weight:bold;">${formatCurrency(product.price)}</td>
      <td>${stockText(product)}</td>
      <td>
        <div class="action-btns">
          <button class="btn-edit" data-action="edit" data-id="${escapeHtml(product.id)}">S\u1eeda</button>
          <button class="btn-delete" data-action="delete" data-id="${escapeHtml(product.id)}">X\u00f3a</button>
        </div>
      </td>
    </tr>
  `).join('');

  tableBody.innerHTML = `${warningRow}${rows}`;
}

function createEditVariantRow(variant = {}) {
  const row = document.createElement('tr');
  row.dataset.variantId = variant.product_variant_id || variant.productVariantId || variant.variant_id || variant.id || '';
  row.innerHTML = `
    <td><input type="text" data-field="ram" value="${escapeHtml(variant.ram || '')}" placeholder="8GB"></td>
    <td><input type="text" data-field="storage_capacity" value="${escapeHtml(variantStorageText(variant))}" placeholder="256GB"></td>
    <td><input type="text" data-field="color" value="${escapeHtml(variant.color || '')}" placeholder="Titan"></td>
    <td><input type="number" data-field="price" value="${Number(variant.price) || 0}" min="0" placeholder="29990000"></td>
    <td><input type="number" data-field="total_available" value="${Number(variant.total_available ?? variant.totalAvailable ?? productStockFromVariant(variant)) || 0}" min="0" placeholder="12"></td>
    <td><input type="url" data-field="variant_image_link" value="${escapeHtml(variant.variant_image_link || variant.variantImageLink || '')}" placeholder="https://..."></td>
    <td><button type="button" class="btn-delete" data-action="remove-edit-variant"><i class="fa-solid fa-trash"></i></button></td>
  `;
  return row;
}

function productStockFromVariant(variant) {
  return Number(variant.total_available ?? variant.totalAvailable ?? variant.stock ?? 0) || 0;
}

function addEditVariantRow(variant = {}) {
  const tableBody = document.querySelector('#editVariantTable tbody');
  if (!tableBody) return;
  tableBody.appendChild(createEditVariantRow(variant));
}

function collectEditVariants() {
  const chip = document.getElementById('editProductChip')?.value.trim() || '';
  const batteryCapacity = document.getElementById('editBatteryCapacity')?.value.trim() || '';
  const resolution = document.getElementById('editResolution')?.value.trim() || '';
  const productImageLink = document.getElementById('editProductImageLink')?.value.trim() || '';

  return Array.from(document.querySelectorAll('#editVariantTable tbody tr'))
    .map((row) => {
      const fieldValue = (field) => row.querySelector(`[data-field="${field}"]`)?.value.trim() || '';
      const storageText = fieldValue('storage_capacity');
      return {
        ram: fieldValue('ram'),
        product_variant_id: row.dataset.variantId || undefined,
        storage: storageText,
        storage_capacity: Number(String(storageText).replace(/\D/g, '')) || 0,
        color: fieldValue('color'),
        price: Number(fieldValue('price')),
        total_available: Number(fieldValue('total_available')) || 0,
        variant_image_link: fieldValue('variant_image_link') || productImageLink,
        battery_capacity: batteryCapacity,
        resolution,
        chip
      };
    })
    .filter((variant) => variant.ram || variant.storage || variant.color || variant.price || variant.total_available);
}

function closeProductEditModal() {
  const modal = document.getElementById('productEditModal');
  if (modal) modal.style.display = 'none';
}

function openProductEditModal(productId) {
  const product = products.find((item) => item.id === productId);
  if (!product) return;

  const variants = productVariants(product);
  const firstVariant = variants[0] || {};
  document.getElementById('editingProductId').value = product.id;
  document.getElementById('editProductName').value = productBaseName(product);
  document.getElementById('editProductBrand').value = product.brand || 'Apple';
  document.getElementById('editProductImageLink').value = product.product_image_link || product.productImageLink || '';
  document.getElementById('editProductChip').value = firstVariant.chip || product.chip || '';
  document.getElementById('editBatteryCapacity').value = firstVariant.battery_capacity || firstVariant.batteryCapacity || product.battery_capacity || '';
  document.getElementById('editResolution').value = firstVariant.resolution || product.resolution || '';

  const tableBody = document.querySelector('#editVariantTable tbody');
  if (tableBody) {
    tableBody.innerHTML = '';
    variants.forEach((variant) => addEditVariantRow(variant));
  }

  const modal = document.getElementById('productEditModal');
  if (modal) modal.style.display = 'flex';
}

async function saveEditedProduct(event) {
  event.preventDefault();

  const productId = document.getElementById('editingProductId')?.value;
  const product = products.find((item) => item.id === productId);
  if (!product) return;

  const nextName = document.getElementById('editProductName')?.value.trim() || '';
  const nextBrand = document.getElementById('editProductBrand')?.value.trim() || '';
  const productImageLink = document.getElementById('editProductImageLink')?.value.trim() || '';
  const variants = collectEditVariants();

  if (!nextName || !nextBrand || !variants.length) {
    await showAdminWarning({
      message: 'Vui lòng nhập tên, hãng và ít nhất một phiên bản cấu hình.',
      confirmText: 'OK'
    });
    return;
  }

  const invalidVariant = variants.some((variant) => Number.isNaN(variant.price) || variant.price <= 0 || variant.total_available < 0);
  if (invalidVariant) {
    await showAdminWarning({
      message: 'Giá bán phải lớn hơn 0 và tồn kho không được âm.',
      confirmText: 'OK'
    });
    return;
  }

  if (useProductsApi()) {
    try {
      await HTApi.admin.products.update(apiProductId(product), {
        product_name: nextName,
        brand: nextBrand,
        product_image_link: productImageLink
      });
    } catch (error) {
      await showAdminError({
        message: error.message || 'Không cập nhật được sản phẩm qua API.',
        confirmText: 'OK'
      });
      return;
    }
  }

  const firstVariant = variants[0];
  products = products.map((item) => item.id === productId
    ? {
        ...item,
        name: `${nextName}${firstVariant.storage ? ` ${firstVariant.storage}` : ''}`.trim(),
        product_name: nextName,
        brand: nextBrand,
        product_image_link: productImageLink,
        price: firstVariant.price,
        stock: variants.reduce((sum, variant) => sum + Number(variant.total_available || 0), 0),
        variants
      }
    : item);

  products = HTAdminCatalog.syncProductsWithDevices(products, HTAdminCatalog.readDevices([]));
  saveProducts();
  renderProducts();
  closeProductEditModal();
}

async function deleteProduct(productId) {
  const product = products.find((item) => item.id === productId);
  if (!product) return;

  const variantIds = new Set((productVariants(product) || []).map((variant) => HTAdminCatalog.normalizedId(variant.product_variant_id || variant.productVariantId || variant.variant_id || variant.id)));
  const hasDevices = HTAdminCatalog.readDevices([]).some((device) => variantIds.has(HTAdminCatalog.normalizedId(HTAdminCatalog.deviceVariantId(device))));
  if (hasDevices) {
    await showAdminWarning({
      title: 'Không thể xóa sản phẩm',
      message: 'Sản phẩm này đang có thiết bị trong kho. Hãy xử lý kho trước để tránh lệch dữ liệu.',
      confirmText: 'OK'
    });
    return;
  }

  const confirmed = await showAdminConfirm({
    title: 'Xóa sản phẩm?',
    message: `Sản phẩm "${product.name}" sẽ bị xóa khỏi danh sách.`,
    confirmText: 'Xóa',
    cancelText: 'Hủy',
    tone: 'danger',
    icon: 'fa-trash-can'
  });

  if (!confirmed) return;

  if (useProductsApi()) {
    try {
      await HTApi.admin.products.remove(apiProductId(product));
    } catch (error) {
      await showAdminError({
        message: error.message || 'Không xóa được sản phẩm qua API.',
        confirmText: 'OK'
      });
      return;
    }
  }

  products = products.filter((item) => item.id !== productId);
  saveProducts();
  renderProducts();
}

function initProductPageEvents() {
  const filterBar = document.querySelector('.filter-bar');
  const searchInput = filterBar ? filterBar.querySelector('input') : null;
  const searchButton = filterBar ? filterBar.querySelector('button') : null;
  const tableBody = document.querySelector('.admin-table tbody');
  const queryText = new URLSearchParams(window.location.search).get('q') || '';

  if (queryText && searchInput) {
    searchInput.value = queryText;
  }

  if (searchButton) {
    searchButton.addEventListener('click', async () => {
      if (useProductsApi()) {
        await loadProducts({ keyword: searchInput ? searchInput.value.trim() : '' });
      }
      renderProducts();
    });
  }

  if (searchInput) {
    searchInput.addEventListener('keydown', async (event) => {
      if (event.key === 'Enter') {
        if (useProductsApi()) {
          await loadProducts({ keyword: searchInput.value.trim() });
        }
        renderProducts();
      }
    });
  }

  if (tableBody) {
    tableBody.addEventListener('click', (event) => {
      const button = event.target.closest('button[data-action]');
      if (!button) return;

      if (button.dataset.action === 'edit') {
        openProductEditModal(button.dataset.id);
      } else if (button.dataset.action === 'delete') {
        deleteProduct(button.dataset.id);
      }
    });
  }

  document.getElementById('productEditForm')?.addEventListener('submit', saveEditedProduct);
  document.getElementById('addEditVariantBtn')?.addEventListener('click', () => addEditVariantRow());
  document.querySelectorAll('[data-close-product-edit]').forEach((button) => {
    button.addEventListener('click', closeProductEditModal);
  });

  document.getElementById('editVariantTable')?.addEventListener('click', (event) => {
    const button = event.target.closest('button[data-action="remove-edit-variant"]');
    if (!button) return;

    const rows = document.querySelectorAll('#editVariantTable tbody tr');
    if (rows.length <= 1) {
      button.closest('tr').querySelectorAll('input').forEach((input) => {
        input.value = '';
      });
      return;
    }

    button.closest('tr').remove();
  });

  document.getElementById('productEditModal')?.addEventListener('click', (event) => {
    if (event.target.id === 'productEditModal') closeProductEditModal();
  });
}

document.addEventListener('DOMContentLoaded', async () => {
  initCommonUI();
  await loadProducts();
  initProductPageEvents();
  renderProducts();
});
