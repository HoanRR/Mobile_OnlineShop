/**
 * Admin devices page script.
 * Keeps imported IMEIs, but renders the inventory as product/variant quantity groups.
 */

const DEVICES_STORAGE_KEY = 'ht_devices';
const DEVICE_PRODUCTS_STORAGE_KEY = 'ht_products';

const defaultDeviceProducts = [
  { id: 'SP001', name: 'iPhone 15 Pro Max 256GB', product_name: 'iPhone 15 Pro Max', brand: 'Apple', price: 29990000, stock: 12 },
  { id: 'SP002', name: 'Samsung Galaxy S24 Ultra', product_name: 'Samsung Galaxy S24 Ultra', brand: 'Samsung', price: 27990000, stock: 8 },
  { id: 'SP003', name: 'Xiaomi 14 Pro', product_name: 'Xiaomi 14 Pro', brand: 'Xiaomi', price: 22500000, stock: 0 }
];

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
let productCatalog = [];

function useDevicesApi() {
  return Boolean(window.HTApi?.isEnabled());
}

function readDevices() {
  return HTAdminCatalog.readDevices(defaultDevices);
}

function saveDevices() {
  HTAdminCatalog.writeDevices(devices);
}

async function loadProductCatalog() {
  if (useDevicesApi()) {
    try {
      const response = await HTApi.products.list({ page: 1, limit: 100 });
      productCatalog = HTApi.listData(response).map(HTApi.mapProduct);
      return;
    } catch (error) {
      console.warn('Khong tai duoc danh sach san pham tu API, dung du lieu mock.', error);
    }
  }

  productCatalog = HTAdminCatalog.syncProductsWithDevices(
    HTAdminCatalog.readProducts(defaultDeviceProducts),
    devices
  );
  HTAdminCatalog.writeProducts(productCatalog);
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

  HTAdminCatalog.normalizeProducts(productCatalog).forEach((product) => {
    (product.variants || []).forEach((variant) => {
      const variantId = variant.product_variant_id || variant.productVariantId || variant.variant_id || variant.id;
      const storage = HTAdminCatalog.storageText(variant);
      const color = variant.color ? ` ${variant.color}` : '';
      const label = `${HTAdminCatalog.baseProductName(product) || product.name || 'Sản phẩm'} ${storage}${color}`.trim();
      map.set(String(variantId), label);
    });
  });

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
  const groups = new Map();
  const variantIndex = HTAdminCatalog.buildVariantIndex(productCatalog);

  HTAdminCatalog.normalizeProducts(productCatalog).forEach((product) => {
    (product.variants || []).forEach((variant) => {
      const variantId = String(variant.product_variant_id || variant.productVariantId || variant.variant_id || variant.id || '-');
      const productName = HTAdminCatalog.baseProductName(product) || product.name || 'Sản phẩm';
      const available = Number(variant.total_available ?? variant.totalAvailable ?? 0) || 0;
      const key = `${variantId}::${productName}`;
      groups.set(key, {
        variantId,
        productName,
        total: available,
        available,
        sold: 0,
        latestImei: '',
        latestImportedAt: ''
      });
    });
  });

  devices.forEach((device) => {
    const variantId = String(device.product_variant_id || device.productVariantId || '-');
    const catalogEntry = variantIndex.get(HTAdminCatalog.normalizedId(variantId));
    if (!catalogEntry) return;

    const productName = HTAdminCatalog.baseProductName(catalogEntry.product) || catalogEntry.product.name;
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
    if (isSold(device)) {
      row.sold += 1;
      row.total = Math.max(row.total, row.available + row.sold);
    }

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
  const totalDevices = rows.reduce((sum, row) => sum + (Number(row.total) || 0), 0);

  if (countEl) countEl.textContent = `${rows.length} dòng / ${totalDevices} thiết bị`;
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

function setupImportSuggestions() {
  const productInput = document.getElementById('importProductName');
  const variantInput = document.getElementById('variantId');
  if (!productInput || !variantInput) return;

  let productList = document.getElementById('productNameOptions');
  if (!productList) {
    productList = document.createElement('datalist');
    productList.id = 'productNameOptions';
    document.body.appendChild(productList);
  }

  let variantList = document.getElementById('variantIdOptions');
  if (!variantList) {
    variantList = document.createElement('datalist');
    variantList.id = 'variantIdOptions';
    document.body.appendChild(variantList);
  }

  productInput.setAttribute('list', productList.id);
  variantInput.setAttribute('list', variantList.id);
  productList.innerHTML = '';
  variantList.innerHTML = '';

  HTAdminCatalog.normalizeProducts(productCatalog).forEach((product) => {
    const productName = HTAdminCatalog.baseProductName(product) || product.name;
    if (productName) {
      const option = document.createElement('option');
      option.value = productName;
      productList.appendChild(option);
    }

    (product.variants || []).forEach((variant) => {
      const option = document.createElement('option');
      const variantId = variant.product_variant_id || variant.productVariantId || variant.variant_id || variant.id || '';
      const storage = HTAdminCatalog.storageText(variant);
      option.value = variantId;
      option.label = `${productName}${storage ? ` - ${storage}` : ''}${variant.color ? ` - ${variant.color}` : ''}`;
      variantList.appendChild(option);
    });
  });
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

  const variantEntryById = HTAdminCatalog.buildVariantIndex(productCatalog).get(HTAdminCatalog.normalizedId(variantId));
  if (!variantEntryById) {
    setImportMessage('Sản phẩm này chưa tồn tại. Vui lòng thêm sản phẩm mới trước khi nhập kho.', 'error');
    await showAdminWarning({
      title: 'Sản phẩm chưa tồn tại',
      message: 'Sản phẩm hoặc mã biến thể này chưa có trong danh sách sản phẩm. Vui lòng thêm sản phẩm mới trước khi nhập kho.',
      confirmText: 'OK'
    });
    return;
  }

  const variantEntry = HTAdminCatalog.findVariant(productCatalog, variantId, productName);
  if (!variantEntry) {
    setImportMessage('Tên sản phẩm không khớp với mã biến thể đã chọn.', 'error');
    await showAdminWarning({
      title: 'Sai sản phẩm hoặc mã biến thể',
      message: 'Tên sản phẩm không khớp với mã biến thể. Hãy chọn đúng sản phẩm đã có trong danh sách.',
      confirmText: 'OK'
    });
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
  const catalogProductName = HTAdminCatalog.baseProductName(variantEntry.product) || productName;
  const importedDevices = uniqueImeis.map((imei) => ({
    imei,
    product_variant_id: variantId,
    product_name: catalogProductName,
    color: color || variantEntry.variant.color || '',
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
        ...apiDevices.map((device) => ({ ...device, product_name: catalogProductName, color: color || variantEntry.variant.color || '', warranty_months: warrantyMonths })),
        ...devices
      ];
      productCatalog = HTAdminCatalog.increaseVariantStock(productCatalog, variantId, uniqueImeis.length);
    } catch (error) {
      setImportMessage(error.message || 'Không nhập được IMEI qua API.', 'error');
      return;
    }
  } else {
    devices = [...importedDevices, ...devices];
    productCatalog = HTAdminCatalog.increaseVariantStock(productCatalog, variantId, uniqueImeis.length);
    HTAdminCatalog.writeProducts(productCatalog);
  }

  saveDevices();
  setupImportSuggestions();
  renderDevices();
  event.currentTarget.reset();
  const warrantyInput = document.getElementById('warrantyMonths');
  if (warrantyInput) warrantyInput.value = '12';
  setImportMessage(`Đã nhập ${uniqueImeis.length} thiết bị cho ${catalogProductName}.`);
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

document.addEventListener('DOMContentLoaded', async () => {
  initCommonUI();
  devices = readDevices();
  await loadProductCatalog();
  saveDevices();
  setupImportSuggestions();
  renderDevices();

  document.getElementById('importDeviceForm')?.addEventListener('submit', importDevices);
  document.getElementById('lookupBtn')?.addEventListener('click', lookupDevice);
  document.getElementById('lookupImei')?.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') lookupDevice();
  });
});
