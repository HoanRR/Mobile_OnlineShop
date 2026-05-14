/**
 * Admin devices page script.
 * Keeps imported IMEIs, but renders the inventory as product/variant quantity groups.
 */

const DEVICES_STORAGE_KEY = 'ht_devices';
const DEVICE_PRODUCTS_STORAGE_KEY = 'ht_products';

const defaultDevices = [
  {
    imei: '356789101234567',
    product_variant_id: 'PV1001',
    product_name: 'iPhone 15 Pro Max 256GB',
    color: 'Titan',
    status: 'AVAILABLE',
    imported_at: '2026-05-01',
    warranty_months: 12
  },
  {
    imei: '356789101234568',
    product_variant_id: 'PV1002',
    product_name: 'Samsung Galaxy S24 Ultra',
    color: 'Đen',
    status: 'SOLD',
    order_id: 'DH1001',
    imported_at: '2026-04-01',
    sold_at: '2026-04-06',
    warranty_start: '2026-04-06',
    warranty_end: '2027-04-06',
    warranty_months: 12
  }
];

let devices = [];

function useDevicesApi() {
  return Boolean(window.HTApi?.isEnabled());
}

function readDevices() {
  try {
    const saved = JSON.parse(localStorage.getItem(DEVICES_STORAGE_KEY) || 'null');
    return Array.isArray(saved) && saved.length ? saved : [...defaultDevices];
  } catch (error) {
    return [...defaultDevices];
  }
}

function saveDevices() {
  localStorage.setItem(DEVICES_STORAGE_KEY, JSON.stringify(devices));
}

function formatDate(dateValue) {
  if (!dateValue) return '-';
  const date = new Date(`${String(dateValue).slice(0, 10)}T00:00:00`);
  if (Number.isNaN(date.getTime())) return dateValue;
  return date.toLocaleDateString('vi-VN');
}

function splitImeis(value) {
  return String(value || '')
    .split(/[\s,;]+/)
    .map((imei) => imei.trim())
    .filter(Boolean);
}

function readProductVariantNames() {
  const map = new Map();

  try {
    const products = JSON.parse(localStorage.getItem(DEVICE_PRODUCTS_STORAGE_KEY) || '[]');
    if (!Array.isArray(products)) return map;

    products.forEach((product) => {
      (product.variants || []).forEach((variant, index) => {
        const variantId = variant.product_variant_id || variant.productVariantId || variant.variant_id || variant.id || `${product.id || 'PV'}-${index + 1}`;
        const storage = variant.storage || (variant.storage_capacity ? `${variant.storage_capacity}GB` : '');
        const color = variant.color ? ` ${variant.color}` : '';
        const label = `${product.product_name || product.name || 'Sản phẩm'} ${storage}${color}`.trim();
        map.set(String(variantId), label);
      });
    });
  } catch (error) {
    return map;
  }

  return map;
}

function productNameForDevice(device, variantNameMap = readProductVariantNames()) {
  return device.product_name
    || device.productName
    || variantNameMap.get(String(device.product_variant_id || device.productVariantId || ''))
    || 'Chưa xác định';
}

function isSold(device) {
  return String(device.status || '').toUpperCase() === 'SOLD' || Boolean(device.order_id || device.orderId);
}

function statusLabel(device) {
  const sold = isSold(device);
  return `<span class="device-status ${sold ? 'sold' : 'available'}">${sold ? 'Đã bán' : 'Còn kho'}</span>`;
}

function buildInventoryRows() {
  const variantNameMap = readProductVariantNames();
  const groups = new Map();

  devices.forEach((device) => {
    const variantId = String(device.product_variant_id || device.productVariantId || '-');
    const productName = productNameForDevice(device, variantNameMap);
    const key = `${variantId}::${productName}`;
    const importedAt = String(device.imported_at || device.importedAt || '').slice(0, 10);

    if (!groups.has(key)) {
      groups.set(key, {
        variantId,
        productName,
        total: 0,
        available: 0,
        sold: 0,
        latestImei: '',
        latestImportedAt: ''
      });
    }

    const row = groups.get(key);
    row.total += 1;
    if (isSold(device)) row.sold += 1;
    else row.available += 1;

    if (!row.latestImportedAt || importedAt >= row.latestImportedAt) {
      row.latestImportedAt = importedAt;
      row.latestImei = device.imei || '-';
    }
  });

  return Array.from(groups.values()).sort((a, b) => a.productName.localeCompare(b.productName, 'vi'));
}

function renderDevices() {
  const tableBody = document.querySelector('.admin-table tbody');
  const countEl = document.getElementById('deviceCount');
  const rows = buildInventoryRows();

  if (countEl) countEl.textContent = `${rows.length} dòng / ${devices.length} thiết bị`;
  if (!tableBody) return;

  if (!rows.length) {
    tableBody.innerHTML = '<tr><td colspan="7" style="text-align:center; color:var(--muted); padding:28px;">Chưa có thiết bị trong kho</td></tr>';
    return;
  }

  tableBody.innerHTML = rows.map((row) => `
    <tr>
      <td><strong style="color:var(--text);">${row.productName}</strong></td>
      <td style="color:var(--muted);">${row.variantId}</td>
      <td style="color:var(--text); font-weight:700;">${row.total}</td>
      <td style="color:var(--green); font-weight:700;">${row.available}</td>
      <td style="color:var(--blue); font-weight:700;">${row.sold}</td>
      <td style="color:var(--muted);">${row.latestImei || '-'}</td>
      <td style="color:var(--muted);">${formatDate(row.latestImportedAt)}</td>
    </tr>
  `).join('');
}

function renderLookup(device) {
  const result = document.getElementById('deviceLookupResult');
  if (!result) return;

  if (!device) {
    result.innerHTML = '<div class="lookup-card">Không tìm thấy IMEI trong kho.</div>';
    return;
  }

  result.innerHTML = `
    <div class="lookup-card">
      <div><strong>IMEI:</strong> ${device.imei}</div>
      <div><strong>Sản phẩm:</strong> ${productNameForDevice(device)}</div>
      <div><strong>Mã biến thể:</strong> ${device.product_variant_id || device.productVariantId || '-'}</div>
      <div><strong>Trạng thái:</strong> ${statusLabel(device)}</div>
      <div><strong>Đơn hàng:</strong> ${device.order_id || device.orderId || '-'}</div>
      <div><strong>Bảo hành đến:</strong> ${isSold(device) ? formatDate(device.warranty_end || device.warrantyEnd) : '-'}</div>
    </div>
  `;
}

function setImportMessage(text, type = 'success') {
  const message = document.getElementById('importDeviceMessage');
  if (!message) return;
  message.textContent = text;
  message.className = `form-message ${type}`;
}

function clearImportMessage() {
  const message = document.getElementById('importDeviceMessage');
  if (!message) return;
  message.textContent = '';
  message.className = 'form-message';
}

async function importDevices(event) {
  event.preventDefault();
  clearImportMessage();

  const productName = document.getElementById('importProductName')?.value.trim();
  const variantIdText = document.getElementById('variantId')?.value.trim();
  const variantId = Number(variantIdText) || variantIdText;
  const color = document.getElementById('importColor')?.value.trim() || '';
  const warrantyMonths = Math.max(1, Number(document.getElementById('warrantyMonths')?.value) || 12);
  const imeis = splitImeis(document.getElementById('imeiListInput')?.value);

  if (!productName || !variantId || !imeis.length) {
    setImportMessage('Vui lòng nhập tên sản phẩm, mã biến thể và ít nhất một IMEI.', 'error');
    return;
  }

  const uniqueImeis = Array.from(new Set(imeis.map((imei) => imei.toUpperCase())));
  if (uniqueImeis.length !== imeis.length) {
    setImportMessage('Danh sách IMEI đang bị trùng.', 'error');
    return;
  }

  const existed = uniqueImeis.find((imei) => devices.some((device) => String(device.imei || '').toUpperCase() === imei));
  if (existed) {
    setImportMessage(`IMEI ${existed} đã tồn tại trong kho.`, 'error');
    return;
  }

  const today = new Date().toISOString().slice(0, 10);
  const importedDevices = uniqueImeis.map((imei) => ({
    imei,
    product_variant_id: variantId,
    product_name: productName,
    color,
    status: 'AVAILABLE',
    imported_at: today,
    warranty_months: warrantyMonths
  }));

  if (useDevicesApi()) {
    try {
      const response = await HTApi.admin.devices.import({
        product_variant_id: variantId,
        imei_list: uniqueImeis
      });
      const apiDevices = Array.isArray(response?.devices) ? response.devices.map(HTApi.mapDevice) : importedDevices;
      devices = [
        ...apiDevices.map((device) => ({ ...device, product_name: productName, color, warranty_months: warrantyMonths })),
        ...devices
      ];
    } catch (error) {
      setImportMessage(error.message || 'Không nhập được IMEI qua API.', 'error');
      return;
    }
  } else {
    devices = [...importedDevices, ...devices];
  }

  saveDevices();
  renderDevices();
  event.currentTarget.reset();
  const warrantyInput = document.getElementById('warrantyMonths');
  if (warrantyInput) warrantyInput.value = '12';
  setImportMessage(`Đã nhập ${uniqueImeis.length} thiết bị cho ${productName}.`);
}

async function lookupDevice() {
  const value = document.getElementById('lookupImei')?.value.trim().toUpperCase();
  if (!value) {
    renderLookup(null);
    return;
  }

  if (useDevicesApi()) {
    try {
      const device = HTApi.mapDevice(await HTApi.admin.devices.lookup(value));
      renderLookup(device);
      return;
    } catch (error) {
      renderLookup(null);
      return;
    }
  }

  renderLookup(devices.find((device) => String(device.imei || '').toUpperCase() === value));
}

document.addEventListener('DOMContentLoaded', () => {
  initCommonUI();
  devices = readDevices();
  saveDevices();
  renderDevices();

  document.getElementById('importDeviceForm')?.addEventListener('submit', importDevices);
  document.getElementById('lookupBtn')?.addEventListener('click', lookupDevice);
  document.getElementById('lookupImei')?.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') lookupDevice();
  });
});
