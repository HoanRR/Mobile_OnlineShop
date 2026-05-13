/**
 * POS Sales Page JavaScript
 * Mock cart and checkout while backend APIs are not connected.
 */

const POS_CART_STORAGE_KEY = 'ht_pos_cart';
const POS_PENDING_CART_KEY = 'ht_pos_pending_cart';

let cart = [];

function usePosApi() {
  return Boolean(window.HTApi?.isEnabled());
}

function formatMoney(amount) {
  if (typeof formatCurrency === 'function') return formatCurrency(Number(amount) || 0);
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(amount) || 0);
}

function escapeHtml(value) {
  const div = document.createElement('div');
  div.textContent = value ?? '';
  return div.innerHTML;
}

function normalizeText(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

function readSavedCart() {
  try {
    const saved = JSON.parse(sessionStorage.getItem(POS_CART_STORAGE_KEY) || '[]');
    return Array.isArray(saved) ? saved : [];
  } catch (error) {
    return [];
  }
}

function saveCart() {
  sessionStorage.setItem(POS_CART_STORAGE_KEY, JSON.stringify(cart));
}

function addToCart(name, price, variantId = '', imei = '') {
  const item = cart.find((cartItem) => cartItem.name === name);
  if (item) {
    item.qty += 1;
  } else {
    cart.push({
      name,
      price: Number(price) || 0,
      qty: 1,
      variantId: variantId || `PV-${normalizeText(name).replace(/\s+/g, '-').toUpperCase()}`,
      imei
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
  const grid = document.querySelector('.product-grid');
  if (!grid) return;

  if (!products.length) {
    grid.innerHTML = `
      <div style="color: var(--muted); grid-column: 1 / -1; text-align: center; padding: 40px;">
        Kh\u00f4ng t\u00ecm th\u1ea5y s\u1ea3n ph\u1ea9m ph\u00f9 h\u1ee3p
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
        <img src="${escapeHtml(productImage(mapped))}" alt="${escapeHtml(mapped.name)}">
        <h4>${escapeHtml(mapped.name)}</h4>
        <p>${formatMoney(mapped.price)}</p>
      </div>
    `;
  }).join('');
}

async function loadPOSProducts(keyword = '') {
  if (!usePosApi()) return;

  try {
    const response = await HTApi.products.list({ page: 1, limit: 24, keyword });
    renderPOSProducts(HTApi.listData(response));
  } catch (error) {
    console.warn('Khong tai duoc san pham POS tu API:', error);
  }
}

function filterPOSProducts() {
  const searchInput = document.querySelector('.pos-search input');
  const keyword = normalizeText(searchInput ? searchInput.value : '');
  const items = document.querySelectorAll('.pos-item');

  items.forEach((item) => {
    const name = normalizeText(item.querySelector('h4')?.textContent);
    item.style.display = !keyword || name.includes(keyword) ? '' : 'none';
  });
}

function initPOSEvents() {
  const searchInput = document.querySelector('.pos-search input');
  const searchButton = document.querySelector('.pos-search button');

  if (searchInput) {
    searchInput.addEventListener('input', () => {
      if (!usePosApi()) filterPOSProducts();
    });
    searchInput.addEventListener('keydown', (event) => {
      if (event.key !== 'Enter') return;
      if (usePosApi()) {
        loadPOSProducts(searchInput.value.trim());
      } else {
        filterPOSProducts();
      }
    });
  }

  if (searchButton) {
    searchButton.addEventListener('click', () => {
      if (usePosApi()) {
        loadPOSProducts(searchInput ? searchInput.value.trim() : '');
      } else {
        filterPOSProducts();
      }
    });
  }

  const productGrid = document.querySelector('.product-grid');
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
