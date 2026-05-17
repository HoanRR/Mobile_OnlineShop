/**
 * Checkout info page script
 * Creates a mock POS order from the pending cart.
 */

const CHECKOUT_CART_KEY = 'ht_pos_cart';
const CHECKOUT_PENDING_CART_KEY = 'ht_pos_pending_cart';
const CHECKOUT_ORDERS_KEY = 'ht_orders';
const CHECKOUT_DEVICES_KEY = 'ht_devices';

const checkoutDefaultOrders = [
  { id: 'DH1001', customerName: 'Nguyễn Văn Quang', date: '2026-04-06', total: 29990000, status: 'WAIT', order_status: 'WAIT' },
  { id: 'DH1002', customerName: 'Trần Thị B', date: '2026-04-05', total: 15500000, status: 'SHIPPING', order_status: 'SHIPPING' },
  { id: 'DH1003', customerName: 'Lê Hoàng C', date: '2026-04-04', total: 33990000, status: 'DELIVERED', order_status: 'DELIVERED' }
];

let checkoutCart = [];
let isCreatingOfflineOrder = false;

function useCheckoutApi() {
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

function readJson(key, fallback) {
  try {
    const saved = JSON.parse(sessionStorage.getItem(key) || localStorage.getItem(key) || 'null');
    return Array.isArray(saved) ? saved : fallback;
  } catch (error) {
    return fallback;
  }
}

function readOrders() {
  try {
    const raw = localStorage.getItem(CHECKOUT_ORDERS_KEY);
    if (!raw) return [...checkoutDefaultOrders];
    const saved = JSON.parse(raw);
    return Array.isArray(saved) ? saved : [...checkoutDefaultOrders];
  } catch (error) {
    return [...checkoutDefaultOrders];
  }
}

function createOrderId(orders) {
  const maxNumber = orders.reduce((max, order) => {
    const value = Number(String(order.id || '').replace(/\D/g, ''));
    return Number.isNaN(value) ? max : Math.max(max, value);
  }, 1000);
  return `DH${maxNumber + 1}`;
}

function addMonths(dateValue, months) {
  const date = new Date(`${dateValue}T00:00:00`);
  date.setMonth(date.getMonth() + months);
  return date.toISOString().slice(0, 10);
}

function syncSoldDevices(imeis, orderId) {
  let devices = [];
  try {
    const saved = JSON.parse(localStorage.getItem(CHECKOUT_DEVICES_KEY) || '[]');
    devices = Array.isArray(saved) ? saved : [];
  } catch (error) {
    devices = [];
  }

  const today = new Date().toISOString().slice(0, 10);
  const expandedItems = getExpandedCartItems();
  imeis.forEach((imei, index) => {
    const normalizedImei = imei.toUpperCase();
    const cartItem = expandedItems[index] || checkoutCart[0] || {};
    const existing = devices.find((device) => String(device.imei || '').toUpperCase() === normalizedImei);
    const warrantyMonths = Number(existing?.warranty_months || 12);
    const payload = {
      imei: normalizedImei,
      product_variant_id: existing?.product_variant_id || cartItem.variantId || cartItem.id || `PV-${index + 1}`,
      product_name: existing?.product_name || cartItem.name || 'Thiết bị HT Mobile',
      status: 'SOLD',
      order_id: orderId,
      sold_at: today,
      warranty_start: today,
      warranty_end: addMonths(today, warrantyMonths),
      warranty_months: warrantyMonths
    };

    if (existing) {
      Object.assign(existing, payload);
    } else {
      devices.unshift({ ...payload, imported_at: today });
    }
  });

  localStorage.setItem(CHECKOUT_DEVICES_KEY, JSON.stringify(devices));
}

function getSubtotal() {
  return checkoutCart.reduce((sum, item) => sum + Number(item.price || 0) * Number(item.qty || 0), 0);
}

function getDiscount() {
  const input = document.getElementById('discountAmount');
  const value = Number(input ? input.value : 0);
  return Number.isFinite(value) && value > 0 ? value : 0;
}

function getTotalQuantity() {
  return checkoutCart.reduce((sum, item) => sum + Number(item.qty || 0), 0);
}

function getExpandedCartItems() {
  const items = [];
  checkoutCart.forEach((item) => {
    const qty = Number(item.qty || 0);
    for (let index = 0; index < qty; index += 1) {
      items.push(item);
    }
  });
  return items;
}

function renderImeiInputs() {
  const imeiList = document.getElementById('imeiList');
  if (!imeiList) return;
  const requiredCount = getTotalQuantity();

  if (!checkoutCart.length) {
    imeiList.innerHTML = '<div style="color:var(--muted);">Chưa có sản phẩm cần nhập IMEI.</div>';
    return;
  }

  if (imeiList.querySelectorAll('.imei-input').length === requiredCount) return;

  const rows = [];
  checkoutCart.forEach((item) => {
    const qty = Number(item.qty || 0);
    const safeName = escapeHtml(item.name);
    item = { ...item, name: safeName };
    for (let index = 1; index <= qty; index += 1) {
      rows.push(`
        <div class="imei-row">
          <label>${safeName} ${qty > 1 ? `#${index}` : ''}</label>
          <input type="text" class="imei-input" data-product-name="${item.name}" placeholder="Nhập IMEI thiết bị" required>
        </div>
      `);
    }
  });

  imeiList.innerHTML = rows.join('');
}

function collectImeis() {
  return Array.from(document.querySelectorAll('.imei-input'))
    .map((input) => input.value.trim())
    .filter(Boolean);
}

function renderSummary() {
  const summaryItems = document.getElementById('summaryItems');
  const subtotalEl = document.getElementById('summarySubtotal');
  const discountEl = document.getElementById('summaryDiscount');
  const totalEl = document.getElementById('summaryTotal');

  if (!summaryItems || !subtotalEl || !discountEl || !totalEl) return;

  if (!checkoutCart.length) {
    summaryItems.innerHTML = '<div style="color:var(--muted);">Chưa có sản phẩm trong giỏ hàng.</div>';
  } else {
    summaryItems.innerHTML = checkoutCart.map((item) => {
      const lineTotal = Number(item.price || 0) * Number(item.qty || 0);
      return `
        <div class="summary-item">
          <div>
            <div class="summary-item-name">${escapeHtml(item.name)}</div>
            <div class="summary-item-meta">${formatMoney(item.price)} x ${item.qty}</div>
          </div>
          <div class="summary-item-price">${formatMoney(lineTotal)}</div>
        </div>
      `;
    }).join('');
  }

  const subtotal = getSubtotal();
  const discount = Math.min(getDiscount(), subtotal);
  const total = subtotal - discount;

  subtotalEl.textContent = formatMoney(subtotal);
  discountEl.textContent = formatMoney(discount);
  totalEl.textContent = formatMoney(total);
  renderImeiInputs();
}

function renderReceipt(order, imeis) {
  const body = document.getElementById('receiptBody');
  const orderIdEl = document.getElementById('receiptOrderId');
  if (!body) return;

  order = {
    ...order,
    customerName: escapeHtml(order.customerName),
    customerPhone: escapeHtml(order.customerPhone || '-'),
    paymentMethod: escapeHtml(order.paymentMethod),
    shipping_address: escapeHtml(order.shipping_address)
  };

  if (orderIdEl) orderIdEl.textContent = `Mã đơn ${order.id}`;

  const items = order.cartItems || [];
  let imeiOffset = 0;
  const itemRows = items.map((item) => {
    const qty = Number(item.qty || 0);
    const lineTotal = Number(item.price || 0) * qty;
    const itemImeis = imeis.slice(imeiOffset, imeiOffset + qty).join(', ');
    imeiOffset += qty;
    return `
      <tr>
        <td>${escapeHtml(item.name)}</td>
        <td>${qty}</td>
        <td>${escapeHtml(itemImeis || '-')}</td>
        <td style="text-align:right; font-weight:700;">${formatMoney(lineTotal)}</td>
      </tr>
    `;
  }).join('');

  body.innerHTML = `
    <div class="receipt-meta">
      <div><span>Khách hàng</span><br><strong>${order.customerName}</strong></div>
      <div><span>Số điện thoại</span><br><strong>${order.customerPhone || '-'}</strong></div>
      <div><span>Ngày tạo</span><br><strong>${new Date(`${order.date}T00:00:00`).toLocaleDateString('vi-VN')}</strong></div>
      <div><span>Thanh toán</span><br><strong>${order.paymentMethod}</strong></div>
      <div><span>Nhận hàng</span><br><strong>${order.shipping_address}</strong></div>
      <div><span>Trạng thái</span><br><strong>Đã thanh toán</strong></div>
    </div>

    <table class="receipt-table">
      <thead>
        <tr><th>Sản phẩm</th><th>SL</th><th>IMEI</th><th style="text-align:right;">Thành tiền</th></tr>
      </thead>
      <tbody>
        ${itemRows}
      </tbody>
    </table>

    <div class="receipt-total">
      <div class="summary-line"><span>Tạm tính</span><strong>${formatMoney(getSubtotal())}</strong></div>
      <div class="summary-line"><span>Giảm giá</span><strong>${formatMoney(order.discount)}</strong></div>
      <div class="summary-line total"><span>Thành tiền</span><strong>${formatMoney(order.total)}</strong></div>
    </div>
  `;
}

function showOrderSuccessModal(order, imeis) {
  renderReceipt(order, imeis);
  const modal = document.getElementById('orderSuccessModal');
  if (modal) modal.style.display = 'flex';
}

function toggleAddressField() {
  const receiveType = document.getElementById('receiveType');
  const addressGroup = document.getElementById('addressGroup');
  const addressInput = document.getElementById('customerAddress');
  const isDelivery = receiveType && receiveType.value === 'delivery';

  if (addressGroup) addressGroup.style.display = isDelivery ? '' : 'none';
  if (addressInput) addressInput.required = isDelivery;
}

async function handleSubmit(event) {
  event.preventDefault();

  if (isCreatingOfflineOrder) return;

  if (!checkoutCart.length) {
    alert('Giỏ hàng đang trống.');
    window.location.href = 'pos.html';
    return;
  }

  const customerName = document.getElementById('customerName').value.trim() || 'Khách lẻ';
  const customerPhone = document.getElementById('customerPhone').value.trim();
  const customerEmail = document.getElementById('customerEmail').value.trim();
  const receiveType = document.getElementById('receiveType').value;
  const customerAddress = document.getElementById('customerAddress').value.trim();
  const paymentMethod = document.getElementById('paymentMethod').value;
  const note = document.getElementById('orderNote').value.trim();
  const subtotal = getSubtotal();
  const discount = Math.min(getDiscount(), subtotal);
  const total = subtotal - discount;
  const imeis = collectImeis();
  const requiredImeiCount = getTotalQuantity();

  if (receiveType === 'delivery' && !customerAddress) {
    alert('Vui lòng nhập địa chỉ giao hàng.');
    return;
  }

  if (imeis.length !== requiredImeiCount) {
    alert('Vui lòng nhập đủ IMEI cho từng thiết bị trong đơn.');
    return;
  }

  if (new Set(imeis.map((imei) => imei.toUpperCase())).size !== imeis.length) {
    alert('IMEI trong đơn không được trùng nhau.');
    return;
  }

  isCreatingOfflineOrder = true;
  const submitButton = event.submitter || document.querySelector('#checkoutForm .btn-submit');
  if (submitButton) {
    submitButton.disabled = true;
    submitButton.dataset.originalText = submitButton.innerHTML;
    submitButton.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> \u0110ang t\u1ea1o \u0111\u01a1n';
  }

  const orders = readOrders();
  let orderId = createOrderId(orders);
  const apiPayload = {
    receiver_name: customerName,
    receiver_phone: customerPhone,
    shipping_address: receiveType === 'delivery' ? customerAddress : 'Tại cửa hàng',
    payment_method: paymentMethod,
    is_paid: true,
    items: imeis.map((imei) => ({ imei: imei.toUpperCase() }))
  };

  let apiOrder = null;
  if (useCheckoutApi()) {
    try {
      apiOrder = HTApi.mapOrder(await HTApi.staff.orders.createOffline(apiPayload));
      orderId = apiOrder.id || orderId;
    } catch (error) {
      isCreatingOfflineOrder = false;
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.innerHTML = submitButton.dataset.originalText || '<i class="fa-solid fa-check"></i> X\u00e1c nh\u1eadn thanh to\u00e1n';
      }
      alert(error.message || 'Không tạo được đơn qua API.');
      return;
    }
  }

  const backendTotal = Number(apiOrder?.total_amount ?? apiOrder?.totalAmount ?? apiOrder?.total);
  const finalTotal = Number.isFinite(backendTotal) && backendTotal > 0 ? backendTotal : total;
  const responseItems = Array.isArray(apiOrder?.items) && apiOrder.items.length
    ? apiOrder.items
    : imeis.map((imei) => ({ imei: imei.toUpperCase() }));

  const newOrder = {
    id: orderId,
    order_id: orderId,
    customerName,
    customerPhone,
    customerEmail,
    receiver_name: customerName,
    receiver_phone: customerPhone,
    shipping_address: receiveType === 'delivery' ? customerAddress : 'Nhận tại cửa hàng',
    receiveType,
    customerAddress,
    paymentMethod,
    payment_method: paymentMethod,
    is_paid: true,
    note,
    date: new Date().toISOString().slice(0, 10),
    total: finalTotal,
    total_amount: finalTotal,
    discount,
    status: apiOrder?.status || 'DELIVERED',
    order_status: apiOrder?.order_status || apiOrder?.orderStatus || 'DELIVERED',
    source: 'POS',
    cartItems: checkoutCart.map((item) => ({ ...item })),
    items: responseItems,
    apiResponse: apiOrder
  };

  orders.unshift(newOrder);
  localStorage.setItem(CHECKOUT_ORDERS_KEY, JSON.stringify(orders));
  syncSoldDevices(imeis, newOrder.id);
  sessionStorage.removeItem(CHECKOUT_CART_KEY);
  sessionStorage.removeItem(CHECKOUT_PENDING_CART_KEY);
  showOrderSuccessModal(newOrder, imeis);
  isCreatingOfflineOrder = false;
}

function initCheckoutPage() {
  checkoutCart = readJson(CHECKOUT_PENDING_CART_KEY, []);

  if (!checkoutCart.length) {
    checkoutCart = readJson(CHECKOUT_CART_KEY, []);
  }

  const form = document.getElementById('checkoutForm');
  const discountInput = document.getElementById('discountAmount');
  const receiveType = document.getElementById('receiveType');

  if (form) form.addEventListener('submit', handleSubmit);
  if (discountInput) discountInput.addEventListener('input', renderSummary);
  if (receiveType) receiveType.addEventListener('change', toggleAddressField);
  document.getElementById('orderSuccessModal')?.addEventListener('click', (event) => {
    const actionButton = event.target.closest('[data-receipt-action]');
    if (!actionButton) return;

    const action = actionButton.dataset.receiptAction;
    if (action === 'print') {
      window.print();
    } else if (action === 'new') {
      window.location.href = 'pos.html';
    } else if (action === 'orders') {
      const orderId = document.getElementById('receiptOrderId')?.textContent.replace('Mã đơn ', '') || '';
      window.location.href = `orders.html?q=${encodeURIComponent(orderId)}`;
    }
  });

  toggleAddressField();
  renderSummary();
}

document.addEventListener('DOMContentLoaded', () => {
  initCommonUI();
  displayCurrentDate();
  highlightActivePage();
  setupLogout();
  initCheckoutPage();
});
