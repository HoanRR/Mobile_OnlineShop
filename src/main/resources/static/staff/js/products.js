/**
 * Staff products page script
 * Product lookup using the same local mock data as admin.
 */

const STAFF_PRODUCTS_STORAGE_KEY = 'ht_products';

const staffDefaultProducts = [
  { id: 'SP001', name: 'iPhone 15 Plus 256GB', brand: 'Apple', price: 22990000, stock: 12 },
  { id: 'SP002', name: 'Samsung Galaxy S26 Ultra', brand: 'Samsung', price: 31990000, stock: 8 },
  { id: 'SP003', name: 'iPhone 17 Pro Max', brand: 'Apple', price: 34500000, stock: 0 }
];

let staffProducts = [];

function useStaffProductsApi() {
  return Boolean(window.HTApi?.isEnabled());
}

async function loadStaffProducts(query = {}) {
  if (useStaffProductsApi()) {
    try {
      const response = await HTApi.products.list({ page: 1, limit: 100, ...query });
      staffProducts = HTApi.listData(response).map(HTApi.mapProduct);
      return;
    } catch (error) {
      console.warn('Không lấy được sản phẩm từ API, dùng dữ liệu mock.', error);
    }
  }

  try {
    const saved = JSON.parse(localStorage.getItem(STAFF_PRODUCTS_STORAGE_KEY) || 'null');
    staffProducts = Array.isArray(saved) && saved.length ? saved : [...staffDefaultProducts];
  } catch (error) {
    staffProducts = [...staffDefaultProducts];
  }

  if (!localStorage.getItem(STAFF_PRODUCTS_STORAGE_KEY)) {
    localStorage.setItem(STAFF_PRODUCTS_STORAGE_KEY, JSON.stringify(staffProducts));
  }
}

function formatMoney(amount) {
  if (typeof formatCurrency === 'function') return formatCurrency(Number(amount) || 0);
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(amount) || 0);
}

function getFilteredStaffProducts() {
  const searchInput = document.querySelector('.filter-bar input');
  const keyword = normalizeText(searchInput ? searchInput.value : '');

  if (!keyword) return staffProducts;

  return staffProducts.filter((product) => {
    return normalizeText(product.id).includes(keyword.replace(/^#/, ''))
      || normalizeText(product.name).includes(keyword)
      || normalizeText(product.brand).includes(keyword);
  });
}

function renderStaffProducts() {
  const tableBody = document.querySelector('.data-table tbody');
  if (!tableBody) return;

  const products = getFilteredStaffProducts();

  if (!products.length) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="5" style="text-align:center; color:var(--muted); padding:28px;">Kh\u00f4ng t\u00ecm th\u1ea5y s\u1ea3n ph\u1ea9m ph\u00f9 h\u1ee3p</td>
      </tr>
    `;
    return;
  }

  tableBody.innerHTML = products.map((product) => {
    const stock = Number(product.stock) || 0;
    const stockHtml = stock > 0
      ? `<span class="stock-available">${stock}</span> chi\u1ebfc`
      : '<span class="stock-outofstock">H\u1ebft h\u00e0ng</span>';

    return `
      <tr>
        <td class="cell-muted">#${product.id}</td>
        <td><strong>${product.name}</strong></td>
        <td><span class="category-badge">${product.brand}</span></td>
        <td class="price-cell">${formatMoney(product.price)}</td>
        <td>${stockHtml}</td>
      </tr>
    `;
  }).join('');
}

function initStaffProductEvents() {
  const filterBar = document.querySelector('.filter-bar');
  const searchInput = filterBar ? filterBar.querySelector('input') : null;
  const searchButton = filterBar ? filterBar.querySelector('button') : null;
  const queryText = new URLSearchParams(window.location.search).get('q') || '';

  if (queryText && searchInput) {
    searchInput.value = queryText;
  }

  if (searchInput) {
    searchInput.addEventListener('keydown', async (event) => {
      if (event.key === 'Enter') {
        if (useStaffProductsApi()) await loadStaffProducts({ keyword: searchInput.value.trim() });
        renderStaffProducts();
      }
    });
  }

  if (searchButton) {
    searchButton.addEventListener('click', async () => {
      if (useStaffProductsApi()) await loadStaffProducts({ keyword: searchInput ? searchInput.value.trim() : '' });
      renderStaffProducts();
    });
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  initCommonUI();
  displayCurrentDate();
  highlightActivePage();
  setupLogout();
  await loadStaffProducts();
  initStaffProductEvents();
  renderStaffProducts();
});
