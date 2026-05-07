/**
 * POS Sales Page JavaScript
 * Handles POS shopping cart, product selection, and checkout functionality
 */

// ========== SHOPPING CART STATE ==========
let cart = [];

// ========== CART FUNCTIONS ==========
function addToCart(name, price) {
  let item = cart.find(i => i.name === name);
  if (item) {
    item.qty++;
  } else {
    cart.push({ name: name, price: price, qty: 1 });
  }
  renderCart();
}

function removeCart(index) {
  if (index < 0 || index >= cart.length) {
    console.warn('Invalid cart index');
    return;
  }
  cart.splice(index, 1);
  renderCart();
}

function updateQty(index, newQty) {
  if (index < 0 || index >= cart.length) {
    console.warn('Invalid cart index');
    return;
  }
  
  const qty = parseInt(newQty);
  if (qty > 0) {
    cart[index].qty = qty;
  } else {
    cart[index].qty = 1;
  }
  renderCart();
}

function renderCart() {
  const cartItemsEl = document.getElementById('cart-items');
  const totalQtyEl = document.getElementById('total-qty');
  const subtotalEl = document.getElementById('subtotal');
  const totalPriceEl = document.getElementById('total-price');

  if (!cartItemsEl || !totalQtyEl || !subtotalEl || !totalPriceEl) {
    console.warn('Cart display elements not found');
    return;
  }

  let cartHtml = '';
  let totalQty = 0;
  let totalPrice = 0;

  if (cart.length === 0) {
    cartItemsEl.innerHTML = `<div style="color: var(--muted); text-align: center; margin-top: 60px;"><i class="fa-solid fa-cart-arrow-down" style="font-size: 48px; margin-bottom: 16px; opacity: 0.5;"></i><p>Chưa có Sản phẩm nào</p></div>`;
    totalQtyEl.innerText = '0';
    subtotalEl.innerText = '0 ₫';
    totalPriceEl.innerText = '0 ₫';
    return;
  }

  cart.forEach((item, index) => {
    totalQty += item.qty;
    totalPrice += item.qty * item.price;
    cartHtml += `<div class="cart-item"><div class="cart-item-info"><div class="cart-item-name">${item.name}</div><div class="cart-item-price">${formatCurrency(item.price)}</div></div><div class="cart-item-qty"><input type="number" min="1" value="${item.qty}" onchange="updateQty(${index}, this.value)"><button class="btn-remove" onclick="removeCart(${index})"><i class="fa-solid fa-trash"></i></button></div></div>`;
  });

  cartItemsEl.innerHTML = cartHtml;
  totalQtyEl.innerText = totalQty;
  subtotalEl.innerText = formatCurrency(totalPrice);
  totalPriceEl.innerText = formatCurrency(totalPrice);
}

function checkout() {
  if (cart.length === 0) {
    alert('Giỏ hàng đang trống!');
    return;
  }

  const totalAmount = cart.reduce((a, b) => a + (b.price * b.qty), 0);
  if (confirm('Xác nhận thanh toán và in hóa đơn cho: ' + formatCurrency(totalAmount) + '?')) {
    alert('Đã lưu đơn hàng thành công trên hệ thống ảo. RPC Backend sẽ gọi API đoạn này!');
    cart = [];
    renderCart();
  }
}

// ========== PAGE INITIALIZATION ==========
document.addEventListener('DOMContentLoaded', () => {
  initCommonUI();
  displayCurrentDate();
  highlightActivePage();
  setupLogout();
  renderCart();
  console.log('POS page loaded successfully');
});
