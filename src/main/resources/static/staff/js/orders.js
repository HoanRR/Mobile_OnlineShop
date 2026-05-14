/**
 * Staff orders page script
 * Mock order filtering and status updates while backend APIs are not connected.
 */

const STAFF_ORDERS_STORAGE_KEY = 'ht_orders';

const staffDefaultOrders = [
  {
    id: 'DH1001',
    order_id: 'DH1001',
    customerName: 'Nguy\u1ec5n V\u0103n A',
    receiver_name: 'Nguy\u1ec5n V\u0103n A',
    receiver_phone: '0912345678',
    shipping_address: '12 L\u00ea L\u1ee3i, Qu\u1eadn 1, TP.HCM',
    date: '2026-04-06',
    total: 29990000,
    total_amount: 29990000,
    discount_amount: 0,
    payment_method: 'COD',
    status: 'WAIT',
    order_status: 'WAIT',
    is_paid: false,
    items: [
      { order_detail_id: 1, variant_id: 'PV1001', imei: '356789101234568', product_name: 'iPhone 15 Pro Max 256GB', color: 'Titan', storage_capacity: 256, price_at_purchase: 29990000 }
    ]
  },
  {
    id: 'DH1002',
    order_id: 'DH1002',
    customerName: 'Tr\u1ea7n Th\u1ecb B',
    receiver_name: 'Tr\u1ea7n Th\u1ecb B',
    receiver_phone: '0987654321',
    shipping_address: 'Nh\u1eadn t\u1ea1i c\u1eeda h\u00e0ng',
    date: '2026-04-05',
    total: 15500000,
    total_amount: 15500000,
    discount_amount: 0,
    payment_method: 'ATM',
    status: 'SHIPPING',
    order_status: 'SHIPPING',
    is_paid: true,
    items: [
      { order_detail_id: 2, variant_id: 'PV1002', imei: '356789101234569', product_name: 'Samsung Galaxy S24', color: 'Đen', storage_capacity: 128, price_at_purchase: 15500000 }
    ]
  }
];

const staffOrderStatuses = {
  WAIT: { label: 'Ch\u1edd x\u00e1c nh\u1eadn', className: 'status-pending' },
  CONFIRMED: { label: '\u0110\u00e3 x\u00e1c nh\u1eadn', className: 'status-shipping' },
  PROCESSING: { label: '\u0110ang x\u1eed l\u00fd', className: 'status-shipping' },
  SHIPPING: { label: '\u0110ang giao', className: 'status-shipping' },
  DELIVERED: { label: '\u0110\u00e3 ho\u00e0n th\u00e0nh', className: 'status-success' },
  RETURNED: { label: 'Ho\u00e0n tr\u1ea3', className: 'status-cancelled' }
};

let staffOrders = [];
let currentOrderId = null;

function useStaffOrdersApi() {
  return Boolean(window.HTApi?.isEnabled());
}

async function loadStaffOrders(query = {}) {
  if (useStaffOrdersApi()) {
    try {
      const response = await HTApi.orders.list({ page: 1, limit: 100, ...query });
      staffOrders = HTApi.listData(response).map(HTApi.mapOrder);
      return;
    } catch (error) {
      console.warn('Không lấy được đơn hàng từ API, dùng dữ liệu mock.', error);
    }
  }

  try {
    const saved = JSON.parse(localStorage.getItem(STAFF_ORDERS_STORAGE_KEY) || 'null');
    staffOrders = Array.isArray(saved) && saved.length ? saved : [...staffDefaultOrders];
  } catch (error) {
    staffOrders = [...staffDefaultOrders];
  }

  saveStaffOrders();
}

function saveStaffOrders() {
  localStorage.setItem(STAFF_ORDERS_STORAGE_KEY, JSON.stringify(staffOrders));
}

function formatMoney(amount) {
  if (typeof formatCurrency === 'function') return formatCurrency(Number(amount) || 0);
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(amount) || 0);
}

function formatDate(dateValue) {
  if (!dateValue) return '-';
  const date = new Date(`${dateValue}T00:00:00`);
  if (Number.isNaN(date.getTime())) return dateValue;
  return date.toLocaleDateString('vi-VN');
}

function getOrderId(order) {
  return order.id || order.order_id || '';
}

function statusKey(value) {
  const raw = String(value || '').trim();
  const upper = raw.toUpperCase();
  if (staffOrderStatuses[upper]) return upper;

  const normalized = normalizeText(raw);
  if (!normalized) return '';
  if (normalized === 'pending' || normalized === 'wait') return 'WAIT';
  if (normalized === 'confirmed') return 'CONFIRMED';
  if (normalized === 'processing') return 'PROCESSING';
  if (normalized === 'shipping') return 'SHIPPING';
  if (normalized === 'success' || normalized === 'delivery' || normalized === 'done') return 'DELIVERED';
  if (normalized === 'returned' || normalized === 'cancelled') return 'RETURNED';
  if (normalized.includes('cho xac nhan')) return 'WAIT';
  if (normalized.includes('xac nhan')) return 'CONFIRMED';
  if (normalized.includes('xu ly')) return 'PROCESSING';
  if (normalized.includes('dang giao')) return 'SHIPPING';
  if (normalized.includes('giao thanh cong') || normalized.includes('hoan thanh') || normalized.includes('da giao')) return 'DELIVERED';
  if (normalized.includes('huy') || normalized.includes('hoan tra')) return 'RETURNED';
  return upper;
}

function getFilteredStaffOrders() {
  const filterBar = document.querySelector('.filter-bar');
  const searchInput = filterBar ? filterBar.querySelector('input[type="text"]') : null;
  const dateInput = filterBar ? filterBar.querySelector('input[type="date"]') : null;
  const statusSelect = filterBar ? filterBar.querySelector('select') : null;
  const keyword = normalizeText(searchInput ? searchInput.value : '');
  const dateValue = dateInput ? dateInput.value : '';
  const selectedStatus = statusKey(statusSelect ? statusSelect.value : '');

  return staffOrders.filter((order) => {
    const matchesKeyword = !keyword
      || normalizeText(order.id).includes(keyword.replace(/^#/, ''))
      || normalizeText(order.customerName).includes(keyword);
    const orderDate = String(order.date || order.order_date || '').slice(0, 10);
    const matchesDate = !dateValue || orderDate === dateValue;
    const matchesStatus = !selectedStatus || statusKey(order.order_status || order.status) === selectedStatus;
    return matchesKeyword && matchesDate && matchesStatus;
  });
}

function renderStaffOrders() {
  const tableBody = document.querySelector('.data-table tbody');
  if (!tableBody) return;

  const orders = getFilteredStaffOrders();

  if (!orders.length) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="6" style="text-align:center; color:var(--muted); padding:28px;">Kh\u00f4ng t\u00ecm th\u1ea5y \u0111\u01a1n h\u00e0ng ph\u00f9 h\u1ee3p</td>
      </tr>
    `;
    return;
  }

  tableBody.innerHTML = orders.map((order) => {
    const status = staffOrderStatuses[statusKey(order.order_status || order.status)] || staffOrderStatuses.WAIT;
    const orderId = getOrderId(order);
    return `
      <tr>
        <td><strong>#${orderId}</strong></td>
        <td>${order.customerName || order.receiver_name || '-'}</td>
        <td>${formatDate(order.date || order.order_date)}</td>
        <td class="price-cell">${formatMoney(order.total_amount ?? order.total)}</td>
        <td><span class="status-badge ${status.className}">${status.label}</span></td>
        <td>
          <div class="order-actions">
            <button class="btn-view-detail" data-action="detail" data-order-id="${orderId}">Chi ti\u1ebft</button>
            <button class="btn-update-status" data-action="status" data-order-id="${orderId}">C\u1eadp nh\u1eadt</button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

function expandCartItems(order) {
  const expanded = [];
  (order.cartItems || []).forEach((item) => {
    const qty = Number(item.qty || 0);
    for (let index = 0; index < qty; index += 1) {
      expanded.push(item);
    }
  });
  return expanded;
}

function getOrderItems(order) {
  const items = Array.isArray(order.items) ? order.items : [];
  const cartItems = expandCartItems(order);

  if (items.length) {
    return items.map((item, index) => {
      const cartItem = cartItems[index] || {};
      return {
        order_detail_id: item.order_detail_id || index + 1,
        variant_id: item.variant_id || cartItem.variantId || '-',
        imei: item.imei || '-',
        product_name: item.product_name || cartItem.name || 'S\u1ea3n ph\u1ea9m',
        color: item.color || '-',
        storage_capacity: item.storage_capacity || '-',
        price_at_purchase: item.price_at_purchase ?? cartItem.price ?? 0
      };
    });
  }

  return cartItems.map((item, index) => ({
    order_detail_id: index + 1,
    variant_id: item.variantId || '-',
    imei: '-',
    product_name: item.name || 'S\u1ea3n ph\u1ea9m',
    color: '-',
    storage_capacity: '-',
    price_at_purchase: item.price || 0
  }));
}

async function openDetailModal(orderId) {
  let order = staffOrders.find((item) => getOrderId(item) === orderId);
  const modal = document.getElementById('orderDetailModal');
  const content = document.getElementById('orderDetailContent');
  if (!order || !modal || !content) return;

  if (useStaffOrdersApi()) {
    try {
      order = HTApi.mapOrder(await HTApi.orders.detail(String(order.order_id || orderId).replace(/\D/g, '') || orderId));
    } catch (error) {
      console.warn('Không lấy được chi tiết đơn từ API, dùng dữ liệu đang có.', error);
    }
  }

  const status = staffOrderStatuses[statusKey(order.order_status || order.status)] || staffOrderStatuses.WAIT;
  const items = getOrderItems(order);
  const receiverName = order.receiver_name || order.customerName || 'Kh\u00e1ch l\u1ebb';
  const receiverPhone = order.receiver_phone || order.customerPhone || '-';
  const address = order.shipping_address || order.customerAddress || 'Nh\u1eadn t\u1ea1i c\u1eeda h\u00e0ng';
  const totalAmount = order.total_amount ?? order.total ?? 0;
  const discountAmount = order.discount_amount ?? order.discount ?? 0;

  content.innerHTML = `
    <div class="detail-grid">
      <div><span>M\u00e3 \u0111\u01a1n</span><strong>#${getOrderId(order)}</strong></div>
      <div><span>Tr\u1ea1ng th\u00e1i</span><strong><span class="status-badge ${status.className}">${status.label}</span></strong></div>
      <div><span>Ng\u00e0y \u0111\u1eb7t</span><strong>${formatDate(order.date || order.order_date)}</strong></div>
      <div><span>Thanh to\u00e1n</span><strong>${order.is_paid ? '\u0110\u00e3 thanh to\u00e1n' : 'Ch\u01b0a thanh to\u00e1n'} (${order.payment_method || order.paymentMethod || '-'})</strong></div>
      <div><span>Ng\u01b0\u1eddi nh\u1eadn</span><strong>${receiverName}</strong></div>
      <div><span>S\u0110T</span><strong>${receiverPhone}</strong></div>
      <div class="detail-full"><span>\u0110\u1ecba ch\u1ec9</span><strong>${address}</strong></div>
    </div>
    <div class="detail-section-title">S\u1ea3n ph\u1ea9m trong \u0111\u01a1n</div>
    <div class="detail-items">
      ${items.map((item) => `
        <div class="detail-item">
          <div>
            <strong>${item.product_name}</strong>
            <span>IMEI: ${item.imei} | M\u00e0u: ${item.color} | Bộ nhớ: ${item.storage_capacity}</span>
          </div>
          <strong>${formatMoney(item.price_at_purchase)}</strong>
        </div>
      `).join('')}
    </div>
    <div class="detail-total">
      <div><span>Gi\u1ea3m gi\u00e1</span><strong>${formatMoney(discountAmount)}</strong></div>
      <div><span>T\u1ed5ng ti\u1ec1n</span><strong>${formatMoney(totalAmount)}</strong></div>
    </div>
  `;

  modal.style.display = 'flex';
}

function closeDetailModal() {
  const modal = document.getElementById('orderDetailModal');
  if (modal) modal.style.display = 'none';
}

function openModal(orderId) {
  currentOrderId = orderId;
  const modal = document.getElementById('statusModal');
  const modalOrderId = document.getElementById('modalOrderId');
  const select = document.getElementById('newStatus');
  const isPaidInput = document.getElementById('isPaid');
  const order = staffOrders.find((item) => getOrderId(item) === orderId);

  if (modalOrderId) modalOrderId.textContent = `#${orderId}`;
  if (select && order) select.value = statusKey(order.order_status || order.status);
  if (isPaidInput && order) isPaidInput.checked = Boolean(order.is_paid || statusKey(order.order_status || order.status) === 'DELIVERED');
  if (modal) modal.style.display = 'flex';
}

function closeModal() {
  const modal = document.getElementById('statusModal');
  if (modal) modal.style.display = 'none';
  currentOrderId = null;
}

async function saveStatus() {
  const select = document.getElementById('newStatus');
  const isPaidInput = document.getElementById('isPaid');
  const nextStatus = statusKey(select ? select.value : '');
  if (!currentOrderId || !nextStatus) return;

  if (useStaffOrdersApi()) {
    try {
      await HTApi.staff.orders.updateStatus(String(currentOrderId).replace(/\D/g, '') || currentOrderId, {
        order_status: nextStatus,
        is_paid: Boolean(isPaidInput?.checked)
      });
    } catch (error) {
      alert(error.message || 'Không cập nhật được trạng thái qua API.');
      return;
    }
  }

  staffOrders = staffOrders.map((order) => getOrderId(order) === currentOrderId ? { ...order, status: nextStatus, order_status: nextStatus, is_paid: Boolean(isPaidInput?.checked) } : order);
  saveStaffOrders();
  renderStaffOrders();
  alert('\u0110\u00e3 c\u1eadp nh\u1eadt tr\u1ea1ng th\u00e1i \u0111\u01a1n h\u00e0ng.');
  closeModal();
}

function applyStaffOrderQuery() {
  const params = new URLSearchParams(window.location.search);
  const query = params.get('q') || '';
  const storedStatus = sessionStorage.getItem('ht_staff_order_filter_status') || '';
  const status = statusKey(params.get('status') || storedStatus);
  const searchInput = document.querySelector('.filter-bar input[type="text"]');
  const statusSelect = document.querySelector('.filter-bar select');

  if (query && searchInput) searchInput.value = query;
  if (status && statusSelect) statusSelect.value = status;
  sessionStorage.removeItem('ht_staff_order_filter_status');
}

function initStaffOrderEvents() {
  const tableBody = document.querySelector('.data-table tbody');
  const filterBar = document.querySelector('.filter-bar');
  const filterButton = filterBar ? filterBar.querySelector('button') : null;
  const searchInput = filterBar ? filterBar.querySelector('input[type="text"]') : null;
  const modal = document.getElementById('statusModal');

  if (tableBody) {
    tableBody.addEventListener('click', (event) => {
      const button = event.target.closest('button[data-order-id]');
      if (!button) return;

      if (button.dataset.action === 'detail') {
        openDetailModal(button.dataset.orderId);
      } else {
        openModal(button.dataset.orderId);
      }
    });
  }

  if (filterButton) filterButton.addEventListener('click', async () => {
    if (useStaffOrdersApi()) {
      const statusSelect = filterBar ? filterBar.querySelector('select') : null;
      await loadStaffOrders({ order_status: statusSelect ? statusSelect.value : '' });
    }
    renderStaffOrders();
  });

  if (searchInput) {
    searchInput.addEventListener('keydown', async (event) => {
      if (event.key === 'Enter') {
        if (useStaffOrdersApi()) await loadStaffOrders();
        renderStaffOrders();
      }
    });
  }

  if (modal) {
    modal.addEventListener('click', (event) => {
      if (event.target === modal) closeModal();
    });
  }

  const detailModal = document.getElementById('orderDetailModal');
  if (detailModal) {
    detailModal.addEventListener('click', (event) => {
      if (event.target === detailModal) closeDetailModal();
    });
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  initCommonUI();
  displayCurrentDate();
  highlightActivePage();
  setupLogout();
  await loadStaffOrders();
  applyStaffOrderQuery();
  initStaffOrderEvents();
  renderStaffOrders();
});
