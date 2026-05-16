/**
 * POS Bán Hàng - HT Mobile
 * - Sản phẩm được load từ API (database).
 * - Giỏ hàng chỉ tồn tại trong bộ nhớ (in-memory), không dùng localStorage.
 * - Khi chuyển sang trang thanh toán, dữ liệu giỏ hàng được truyền tạm qua sessionStorage (one-time bridge).
 */


const POS_PENDING_KEY = 'ht_pos_pending_cart';

// ===================== State =====================

let cart = [];
let searchDebounce = null;

// ===================== Helpers =====================

function formatMoney(amount) {
  if (typeof formatCurrency === 'function') return formatCurrency(Number(amount) || 0);
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(amount) || 0);
}

function escapeHtml(value) {
  const div = document.createElement('div');
  div.textContent = value ?? '';
  return div.innerHTML;
}

function getProductGrid() {
  return document.getElementById('product-grid');
}

// ===================== Cart - Actions =====================

function addToCart(name, price, variantId = '') {
  const key = variantId || name;
  const existing = cart.find(item => item.key === key);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({
      key,
      name,
      price: Number(price) || 0,
      qty: 1,
      variantId,
    });
  }

  renderCart();
}

function removeCart(index) {
  if (index < 0 || index >= cart.length) return;
  cart.splice(index, 1);
  renderCart();
}

function updateQty(index, newQty) {
  if (index < 0 || index >= cart.length) return;

  const qty = Number(newQty);
  cart[index].qty = Number.isFinite(qty) && qty > 0 ? qty : 1;
  renderCart();
}

function renderCart() {
  const cartItemsEl = document.getElementById('cart-items');
  const totalQtyEl = document.getElementById('total-qty');
  const subtotalEl = document.getElementById('subtotal');
  const totalPriceEl = document.getElementById('total-price');

  if (!cartItemsEl || !totalQtyEl || !subtotalEl || !totalPriceEl) return;

  saveCart();

  if (!cart.length) {
    cartItemsEl.innerHTML = `
      <div style="color: var(--muted); text-align: center; margin-top: 60px;">
        <i class="fa-solid fa-cart-arrow-down" style="font-size: 48px; margin-bottom: 16px; opacity: 0.5;"></i>
        <p>Ch\u01b0a c\u00f3 S\u1ea3n ph\u1ea9m n\u00e0o</p>
      </div>
    `;
    totalQtyEl.textContent = '0';
    subtotalEl.textContent = '0 \u20ab';
    totalPriceEl.textContent = '0 \u20ab';
    return;
  }

  const totalQty = cart.reduce((sum, item) => sum + item.qty, 0);
  const totalPrice = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

  cartItemsEl.innerHTML = cart.map((item, index) => `
    <div class="cart-item">
      <div class="cart-item-info">
        <div class="cart-item-name">${item.name}</div>
        <div class="cart-item-price">${formatMoney(item.price)}</div>
      </div>
      <div class="cart-item-qty">
        <input type="number" min="1" value="${item.qty}" onchange="updateQty(${index}, this.value)">
        <button class="btn-remove" onclick="removeCart(${index})"><i class="fa-solid fa-trash"></i></button>
      </div>
    </div>
  `).join('');

  totalQtyEl.textContent = totalQty;
  subtotalEl.textContent = formatMoney(totalPrice);
  totalPriceEl.textContent = formatMoney(totalPrice);
}

function checkout() {
  if (!cart.length) {
    alert('Gi\u1ecf h\u00e0ng \u0111ang tr\u1ed1ng.');
    return;
  }

  sessionStorage.setItem(POS_PENDING_CART_KEY, JSON.stringify(cart));
  window.location.href = 'checkout-info.html';
}

function productImage(product) {
  const firstVariant = product.variants?.[0] || {};
  return product.product_image_link
    || product.productImageLink
    || product.image
    || firstVariant.variant_image_link
    || firstVariant.variantImageLink
    || '../../static/staff/img/iphone-15-plus_1__1.webp';
}

function renderPOSProducts(products) {
  const grid = document.getElementById('product-grid') || document.querySelector('.product-grid');

  if (!grid) return;

  if (!products.length) {
    grid.innerHTML = `
      <div style="color: var(--muted); grid-column: 1 / -1; text-align: center; padding: 40px;">
        <i class="fa-solid fa-box-open" style="font-size:32px;margin-bottom:12px;opacity:0.5;"></i>
        <p>Kh\u00f4ng t\u00ecm th\u1ea5y s\u1ea3n ph\u1ea9m ph\u00f9 h\u1ee3p</p>
      </div>
    `;
    return;
  }

  grid.innerHTML = products.map((product) => {
    const mapped = HTApi.mapProduct(product);
    const firstVariant = mapped.variants?.[0] || {};
    const variantId = firstVariant.product_variant_id || firstVariant.productVariantId || mapped.product_id || mapped.id;

    return `
      <div class="pos-item" data-add-cart="1" data-name="${escapeHtml(mapped.name)}" data-price="${Number(mapped.price) || 0}" data-variant-id="${escapeHtml(variantId)}">
        <img src="${escapeHtml(productImage(mapped))}" alt="${escapeHtml(mapped.name)}" onerror="this.src='../../static/staff/img/iphone-15-plus_1__1.webp'">
        <h4>${escapeHtml(mapped.name)}</h4>
        <p>${formatMoney(mapped.price)}</p>
      </div>
    `;
  }).join('');
}

async function loadPOSProducts(keyword = '') {
  const grid = getProductGrid();
  if (grid) {
    grid.innerHTML = `
      <div class="pos-loading" style="grid-column:1/-1;text-align:center;padding:40px;color:var(--muted);">
        <i class="fa-solid fa-spinner fa-spin" style="font-size:32px;margin-bottom:12px;"></i>
        <p>\u0110ang t\u1ea3i s\u1ea3n ph\u1ea9m...</p>
      </div>
    `;
  }

  try {
    const response = await HTApi.products.list({ page: 1, limit: 48, keyword });
    renderPOSProducts(HTApi.listData(response));
  } catch (error) {
    console.warn('Khong tai duoc san pham POS tu API:', error);
    if (grid) {
      grid.innerHTML = `
        <div style="color:var(--muted);grid-column:1/-1;text-align:center;padding:40px;">
          <i class="fa-solid fa-triangle-exclamation" style="font-size:32px;margin-bottom:12px;color:#e74c3c;"></i>
          <p>Kh\u00f4ng t\u1ea3i \u0111\u01b0\u1ee3c s\u1ea3n ph\u1ea9m. Vui l\u00f2ng ki\u1ec3m tra k\u1ebft n\u1ed1i.</p>
          <button onclick="loadPOSProducts()" style="margin-top:12px;padding:8px 20px;border-radius:8px;border:1px solid var(--muted);background:transparent;cursor:pointer;">\u21ba Th\u1eed l\u1ea1i</button>
        </div>
      `;
    }
  }
}

function initPOSEvents() {
  const searchInput = document.querySelector('.pos-search input');
  const searchButton = document.querySelector('.pos-search button');

  if (searchInput) {
    let debounceTimer = null;
    searchInput.addEventListener('input', () => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        loadPOSProducts(searchInput.value.trim());
      }, 400);
    });
    searchInput.addEventListener('keydown', (event) => {
      if (event.key !== 'Enter') return;
      clearTimeout(debounceTimer);
      loadPOSProducts(searchInput.value.trim());
    });
  }

  if (searchButton) {
    searchButton.addEventListener('click', () => {
      loadPOSProducts(searchInput ? searchInput.value.trim() : '');
    });
  }

  const productGrid = getProductGrid();
  if (productGrid) {
    productGrid.addEventListener('click', (event) => {
      const item = event.target.closest('.pos-item[data-add-cart="1"]');
      if (!item) return;
      addToCart(item.dataset.name, item.dataset.price, item.dataset.variantId);
    });
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  initCommonUI();
  displayCurrentDate();
  highlightActivePage();
  setupLogout();
  cart = readSavedCart();
  initPOSEvents();
  await loadPOSProducts();
  renderCart();
});
