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

function useProductsApi() {
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

async function loadProducts(query = {}) {
  if (useProductsApi()) {
    try {
      const response = await HTApi.products.list({ page: 1, limit: 100, ...query });
      products = HTApi.listData(response).map(HTApi.mapProduct);
      return;
    } catch (error) {
      console.warn('Không lấy được sản phẩm từ API, dùng dữ liệu mock.', error);
    }
  }

  try {
    const saved = JSON.parse(localStorage.getItem(PRODUCTS_STORAGE_KEY) || 'null');
    products = Array.isArray(saved) && saved.length ? saved : [...defaultProducts];
  } catch (error) {
    products = [...defaultProducts];
  }

  saveProducts();
}

function saveProducts() {
  localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(products));
}

function apiProductId(product) {
  return product.product_id || product.productId || String(product.id || '').replace(/\D/g, '');
}

function normalizeText(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

function formatCurrency(amount) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    minimumFractionDigits: 0
  }).format(Number(amount) || 0);
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
  const stock = Number(product.stock) || 0;
  if (stock <= 0) {
    return '<span style="color:#ef4444; font-weight:600;">H\u1ebft h\u00e0ng</span>';
  }

  return `<span style="color:var(--green); font-weight:600;">${stock} chi\u1ebfc</span>`;
}

function renderProducts() {
  const tableBody = document.querySelector('.admin-table tbody');
  if (!tableBody) return;

  const filteredProducts = getFilteredProducts();

  if (!filteredProducts.length) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="6" style="text-align:center; color:var(--muted); padding:28px;">Kh\u00f4ng t\u00ecm th\u1ea5y s\u1ea3n ph\u1ea9m ph\u00f9 h\u1ee3p</td>
      </tr>
    `;
    return;
  }

  tableBody.innerHTML = filteredProducts.map((product) => `
    <tr>
      <td style="color:var(--muted);">#${product.id}</td>
      <td style="color:var(--text); font-weight:500;">${product.name}</td>
      <td><span style="background:rgba(255,255,255,0.1); padding:4px 10px; border-radius:6px; font-size:12px;">${product.brand}</span></td>
      <td style="color:#FF3D00; font-weight:bold;">${formatCurrency(product.price)}</td>
      <td>${stockText(product)}</td>
      <td>
        <div class="action-btns">
          <button class="btn-edit" data-action="edit" data-id="${product.id}">S\u1eeda</button>
          <button class="btn-delete" data-action="delete" data-id="${product.id}">X\u00f3a</button>
        </div>
      </td>
    </tr>
  `).join('');
}

async function editProduct(productId) {
  const product = products.find((item) => item.id === productId);
  if (!product) return;

  const nextName = prompt('T\u00ean s\u1ea3n ph\u1ea9m:', product.name);
  if (nextName === null) return;

  const nextPrice = prompt('Gi\u00e1 b\u00e1n:', product.price);
  if (nextPrice === null) return;

  const nextStock = prompt('T\u1ed3n kho:', product.stock);
  if (nextStock === null) return;

  const parsedPrice = Number(nextPrice);
  const parsedStock = Number(nextStock);

  if (!nextName.trim() || Number.isNaN(parsedPrice) || parsedPrice < 0 || Number.isNaN(parsedStock) || parsedStock < 0) {
    alert('D\u1eef li\u1ec7u s\u1ea3n ph\u1ea9m kh\u00f4ng h\u1ee3p l\u1ec7.');
    return;
  }

  if (useProductsApi()) {
    try {
      await HTApi.admin.products.update(apiProductId(product), {
        product_name: nextName.trim()
      });
    } catch (error) {
      alert(error.message || 'Không cập nhật được sản phẩm qua API.');
      return;
    }
  }

  products = products.map((item) => item.id === productId
    ? { ...item, name: nextName.trim(), product_name: nextName.trim(), price: parsedPrice, stock: parsedStock }
    : item);

  saveProducts();
  renderProducts();
  alert('\u0110\u00e3 c\u1eadp nh\u1eadt s\u1ea3n ph\u1ea9m.');
}

async function deleteProduct(productId) {
  const product = products.find((item) => item.id === productId);
  if (!product) return;

  if (!confirm(`X\u00f3a s\u1ea3n ph\u1ea9m ${product.name}?`)) return;

  if (useProductsApi()) {
    try {
      await HTApi.admin.products.remove(apiProductId(product));
    } catch (error) {
      alert(error.message || 'Không xóa được sản phẩm qua API.');
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
        editProduct(button.dataset.id);
      } else if (button.dataset.action === 'delete') {
        deleteProduct(button.dataset.id);
      }
    });
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  initCommonUI();
  await loadProducts();
  initProductPageEvents();
  renderProducts();
});
