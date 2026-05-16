/**
 * Orders page script
 * Mock order filtering and status updates while backend APIs are not connected.
 */

const ORDERS_STORAGE_KEY = 'ht_orders';

const defaultOrders = [
  {
    id: 'DH1001',
    order_id: 'DH1001',
    customerName: 'Nguy\u1ec5n V\u0103n Quang',
    receiver_name: 'Nguy\u1ec5n V\u0103n Quang',
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
      { order_detail_id: 2, variant_id: 'PV1002', imei: '356789101234569', product_name: 'Samsung Galaxy S24', color: '\u0110en', storage_capacity: 128, price_at_purchase: 15500000 }
    ]
  },
  {
    id: 'DH1003',
    order_id: 'DH1003',
    customerName: 'L\u00ea Ho\u00e0ng C',
    receiver_name: 'L\u00ea Ho\u00e0ng C',
    receiver_phone: '0900000003',
    shipping_address: '45 Nguy\u1ec5n Hu\u1ec7, TP.HCM',
    date: '2026-04-04',
    total: 33990000,
    total_amount: 33990000,
    discount_amount: 0,
    payment_method: 'ShopeePay',
    status: 'DELIVERED',
    order_status: 'DELIVERED',
    is_paid: true,
    items: [
      { order_detail_id: 3, variant_id: 'PV1003', imei: '356789101234570', product_name: 'iPhone 15 Plus 256GB', color: 'H\u1ed3ng', storage_capacity: 256, price_at_purchase: 33990000 }
    ]
  },
  { id: 'DH1004', order_id: 'DH1004', customerName: 'Ph\u1ea1m V\u0103n D', receiver_name: 'Ph\u1ea1m V\u0103n D', date: '2026-04-01', total: 5400000, total_amount: 5400000, payment_method: 'COD', status: 'RETURNED', order_status: 'RETURNED', is_paid: false, items: [] }
];

const orderStatuses = {
  WAIT: {
    label: 'Ch\u1edd x\u00e1c nh\u1eadn',
    style: 'background:rgba(245,158,11,0.18); color:#f59e0b; padding:4px 10px; border-radius:6px; font-size:12px; font-weight:600;'
  },
  CONFIRMED: {
    label: '\u0110\u00e3 x\u00e1c nh\u1eadn',
    style: 'background:rgba(14,165,233,0.18); color:#38bdf8; padding:4px 10px; border-radius:6px; font-size:12px; font-weight:600;'
  },
  PROCESSING: {
    label: '\u0110ang x\u1eed l\u00fd',
    style: 'background:rgba(14,165,233,0.18); color:#38bdf8; padding:4px 10px; border-radius:6px; font-size:12px; font-weight:600;'
  },
  SHIPPING: {
    label: '\u0110ang giao',
    style: 'background:rgba(59,130,246,0.18); color:var(--blue); padding:4px 10px; border-radius:6px; font-size:12px; font-weight:600;'
  },
  DELIVERED: {
    label: '\u0110\u00e3 giao',
    style: 'background:rgba(34,197,94,0.18); color:var(--green); padding:4px 10px; border-radius:6px; font-size:12px; font-weight:600;'
  },
  RETURNED: {
    label: 'Ho\u00e0n tr\u1ea3',
    style: 'background:rgba(239,68,68,0.18); color:#ef4444; padding:4px 10px; border-radius:6px; font-size:12px; font-weight:600;'
  }
};

let orders = [];
let selectedOrderId = null;

function useOrdersApi() {
  return Boolean(window.HTApi?.isEnabled());
}

async function loadOrders(query = {}) {
  if (useOrdersApi()) {
    try {
      const response = await HTApi.orders.list({ page: 1, limit: 100, ...query });
      orders = HTApi.listData(response).map(HTApi.mapOrder);
      return;
    } catch (error) {
      console.warn('Không lấy được đơn hàng từ API, dùng dữ liệu mock.', error);
    }
  }

  try {
    const saved = JSON.parse(localStorage.getItem(ORDERS_STORAGE_KEY) || 'null');
    orders = Array.isArray(saved) && saved.length ? saved : [...defaultOrders];
  } catch (error) {
    orders = [...defaultOrders];
  }

  saveOrders();
}

function saveOrders() {
  localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders));
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

function getStatusKey(value) {
  const raw = String(value || '').trim();
  const upper = raw.toUpperCase();
  if (orderStatuses[upper]) return upper;

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
  if (normalized.includes('giao thanh cong') || normalized.includes('da giao') || normalized.includes('hoan thanh')) return 'DELIVERED';
  if (normalized.includes('hoan tra') || normalized.includes('huy')) return 'RETURNED';
  return upper;
}

function statusBadge(status) {
  const item = orderStatuses[getStatusKey(status)] || orderStatuses.WAIT;
  return `<span style="${item.style}">${item.label}</span>`;
}

function ensureStatusFilterOptions() {
  const statusSelect = document.querySelector('.filter-bar select');
  if (!statusSelect) return;

  Object.entries(orderStatuses).forEach(([key, item]) => {
    const exists = Array.from(statusSelect.options).some((option) => getStatusKey(option.value || option.textContent) === key);
    if (exists) return;

    const option = document.createElement('option');
    option.value = key;
    option.textContent = item.label;
    statusSelect.appendChild(option);
  });
}

function getFilteredOrders() {
  const filterBar = document.querySelector('.filter-bar');
  const searchInput = filterBar ? filterBar.querySelector('input[type="text"]') : null;
  const dateInput = filterBar ? filterBar.querySelector('input[type="date"]') : null;
  const statusSelect = filterBar ? filterBar.querySelector('select') : null;

  const keyword = normalizeText(searchInput ? searchInput.value : '');
  const dateValue = dateInput ? dateInput.value : '';
  const statusValue = getStatusKey(statusSelect ? statusSelect.value : '');

  return orders.filter((order) => {
    const matchesKeyword = !keyword
      || normalizeText(order.id).includes(keyword.replace(/^#/, ''))
      || normalizeText(order.customerName).includes(keyword);
    const orderDate = String(order.date || order.order_date || '').slice(0, 10);
    const matchesDate = !dateValue || orderDate === dateValue;
    const matchesStatus = !statusValue || getStatusKey(order.order_status || order.status) === statusValue;
    return matchesKeyword && matchesDate && matchesStatus;
  });
}

function renderOrders() {
  const tableBody = document.querySelector('.admin-table tbody');
  if (!tableBody) return;

  const filteredOrders = getFilteredOrders();

  if (!filteredOrders.length) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="6" style="text-align:center; color:var(--muted); padding:28px;">Kh\u00f4ng t\u00ecm th\u1ea5y \u0111\u01a1n h\u00e0ng ph\u00f9 h\u1ee3p</td>
      </tr>
    `;
    return;
  }

  tableBody.innerHTML = filteredOrders.map((order) => {
    const orderId = getOrderId(order);
    return `
    <tr>
      <td><strong style="color:var(--text)">#${orderId}</strong></td>
      <td style="color:var(--text)">${order.customerName || order.receiver_name || '-'}</td>
      <td style="color:var(--muted)">${formatDate(order.date || order.order_date)}</td>
      <td style="color:#FF3D00; font-weight:bold;">${formatCurrency(order.total_amount ?? order.total)}</td>
      <td>${statusBadge(order.order_status || order.status)}</td>
      <td>
        <div class="order-actions">
          <button class="btn-view-detail" data-action="detail" data-order-id="${orderId}">Chi ti\u1ebft</button>
          <button class="btn-edit" data-action="status" data-order-id="${orderId}">C\u1eadp nh\u1eadt</button>
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
  let order = orders.find((item) => getOrderId(item) === orderId);
  const modal = document.getElementById('orderDetailModal');
  const content = document.getElementById('orderDetailContent');
  if (!order || !modal || !content) return;

  if (useOrdersApi()) {
    try {
      order = HTApi.mapOrder(await HTApi.orders.detail(String(order.order_id || orderId).replace(/\D/g, '') || orderId));
    } catch (error) {
      console.warn('Không lấy được chi tiết đơn từ API, dùng dữ liệu đang có.', error);
    }
  }

  const items = getOrderItems(order);
  const receiverName = order.receiver_name || order.customerName || 'Kh\u00e1ch l\u1ebb';
  const receiverPhone = order.receiver_phone || order.customerPhone || '-';
  const address = order.shipping_address || order.customerAddress || 'Nh\u1eadn t\u1ea1i c\u1eeda h\u00e0ng';
  const totalAmount = order.total_amount ?? order.total ?? 0;
  const discountAmount = order.discount_amount ?? order.discount ?? 0;

  content.innerHTML = `
    <div class="detail-grid">
      <div><span>M\u00e3 \u0111\u01a1n</span><strong>#${getOrderId(order)}</strong></div>
      <div><span>Tr\u1ea1ng th\u00e1i</span><strong>${statusBadge(order.order_status || order.status)}</strong></div>
      <div><span>Ng\u00e0y \u0111\u1eb7t</span><strong>${formatDate(order.date || order.order_date)}</strong></div>
      <div><span>Thanh to\u00e1n</span><strong>${order.is_paid ? '\u0110\u00e3 thanh to\u00e1n' : 'Ch\u01b0a thanh to\u00e1n'} (${order.payment_method || order.paymentMethod || '-'})</strong></div>
      <div><span>Ng\u01b0\u1eddi nh\u1eadn</span><strong>${receiverName}</strong></div>
      <div><span>S\u0110T</span><strong>${receiverPhone}</strong></div>
      <div class="detail-full"><span>\u0110\u1ecba ch\u1ec9</span><strong>${address}</strong></div>
    </div>
    <div class="detail-section-title">S\u1ea3n ph\u1ea9m trong \u0111\u01a1n</div>
    <div class="detail-items">
      ${items.length ? items.map((item) => `
        <div class="detail-item">
          <div>
            <strong>${item.product_name}</strong>
            <span>IMEI: ${item.imei} | M\u00e0u: ${item.color} | Bộ nhớ: ${item.storage_capacity}</span>
          </div>
          <strong>${formatCurrency(item.price_at_purchase)}</strong>
        </div>
      `).join('') : '<div class="detail-item"><span>Ch\u01b0a c\u00f3 d\u1eef li\u1ec7u s\u1ea3n ph\u1ea9m cho \u0111\u01a1n n\u00e0y.</span></div>'}
    </div>
    <div class="detail-total">
      <div><span>Gi\u1ea3m gi\u00e1</span><strong>${formatCurrency(discountAmount)}</strong></div>
      <div><span>T\u1ed5ng ti\u1ec1n</span><strong>${formatCurrency(totalAmount)}</strong></div>
    </div>
  `;

  modal.style.display = 'flex';
}

function closeDetailModal() {
  const modal = document.getElementById('orderDetailModal');
  if (modal) modal.style.display = 'none';
}

function openModal(orderId) {
  selectedOrderId = orderId;
  const modal = document.getElementById('statusModal');
  const modalOrderId = document.getElementById('modalOrderId');
  const statusSelect = modal ? modal.querySelector('select') : null;
  const order = orders.find((item) => getOrderId(item) === orderId);

  if (modalOrderId) modalOrderId.textContent = `#${orderId}`;
  if (statusSelect && order) {
    const matchingOption = Array.from(statusSelect.options).find((option) => getStatusKey(option.value || option.textContent) === getStatusKey(order.order_status || order.status));
    if (matchingOption) statusSelect.value = matchingOption.value || matchingOption.textContent;
  }

  if (modal) modal.style.display = 'flex';
}

function closeModal() {
  const modal = document.getElementById('statusModal');
  if (modal) modal.style.display = 'none';
  selectedOrderId = null;
}

async function saveStatus() {
  if (!selectedOrderId) return;

  const modal = document.getElementById('statusModal');
  const statusSelect = modal ? modal.querySelector('select') : null;
  const nextStatus = getStatusKey(statusSelect ? statusSelect.value : '');

  if (!nextStatus) {
    await showAdminWarning({
      message: 'Vui lòng chọn trạng thái mới.',
      confirmText: 'OK'
    });
    return;
  }

  if (useOrdersApi()) {
    try {
      await HTApi.staff.orders.updateStatus(String(selectedOrderId).replace(/\D/g, '') || selectedOrderId, {
        order_status: nextStatus
      });
    } catch (error) {
      await showAdminError({
        message: error.message || 'Không cập nhật được trạng thái qua API.',
        confirmText: 'OK'
      });
      return;
    }
  }

  orders = orders.map((order) => getOrderId(order) === selectedOrderId ? { ...order, status: nextStatus, order_status: nextStatus } : order);
  saveOrders();
  renderOrders();
  closeModal();
  await showAdminNotice({
    title: 'Cập nhật đơn hàng thành công',
    message: 'Đã cập nhật trạng thái đơn hàng.',
    confirmText: 'OK'
  });
}

function applyStatusFromQuery() {
  const params = new URLSearchParams(window.location.search);
  const storedStatus = sessionStorage.getItem('ht_admin_order_filter_status') || '';
  const queryStatus = getStatusKey(params.get('status') || storedStatus);
  const queryText = params.get('q') || '';
  const searchInput = document.querySelector('.filter-bar input[type="text"]');

  if (queryText && searchInput) {
    searchInput.value = queryText;
  }

  if (!queryStatus) return;

  const statusSelect = document.querySelector('.filter-bar select');
  if (!statusSelect) return;

  const matchingOption = Array.from(statusSelect.options).find((option) => getStatusKey(option.value || option.textContent) === queryStatus);
  if (matchingOption) statusSelect.value = matchingOption.value || matchingOption.textContent;
  sessionStorage.removeItem('ht_admin_order_filter_status');
}

function initOrderPageEvents() {
  const tableBody = document.querySelector('.admin-table tbody');
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

  if (filterButton) {
    filterButton.addEventListener('click', async () => {
      if (useOrdersApi()) {
        const statusSelect = filterBar ? filterBar.querySelector('select') : null;
        await loadOrders({ order_status: statusSelect ? statusSelect.value : '' });
      }
      renderOrders();
    });
  }

  if (searchInput) {
    searchInput.addEventListener('keydown', async (event) => {
      if (event.key === 'Enter') {
        if (useOrdersApi()) await loadOrders();
        renderOrders();
      }
    });
  }

  if (modal) {
    modal.querySelectorAll('button').forEach((button) => {
      const label = normalizeText(button.textContent);
      button.onclick = null;
      if (label.includes('huy') || button.textContent.trim() === '\u00d7') {
        button.addEventListener('click', closeModal);
      } else if (label.includes('luu')) {
        button.addEventListener('click', saveStatus);
      }
    });

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
  await loadOrders();
  ensureStatusFilterOptions();
  applyStatusFromQuery();
  initOrderPageEvents();
  renderOrders();
});
