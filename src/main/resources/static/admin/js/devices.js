/**
 * Admin devices page script
 * Mocks /api/admin/devices/import and /api/admin/devices/:imei.
 */

const DEVICES_STORAGE_KEY = 'ht_devices';

const defaultDevices = [
  {
    imei: '356789101234567',
    product_variant_id: 'PV1001',
    status: 'AVAILABLE',
    imported_at: '2026-05-01',
    warranty_months: 12
  },
  {
    imei: '356789101234568',
    product_variant_id: 'PV1002',
    status: 'SOLD',
    order_id: 'DH1001',
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

function initCommonUI() {
  const sidebar = document.getElementById('sidebar');
  const mainContent = document.getElementById('mainContent');
  const toggleBtn = document.getElementById('sidebarToggle');

  if (sidebar && mainContent && toggleBtn) {
    const collapsedKey = 'ht_admin_sidebar_collapsed';
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
  const date = new Date(`${dateValue}T00:00:00`);
  if (Number.isNaN(date.getTime())) return dateValue;
  return date.toLocaleDateString('vi-VN');
}

function splitImeis(value) {
  return String(value || '')
    .split(/[\s,;]+/)
    .map((imei) => imei.trim())
    .filter(Boolean);
}

function statusLabel(device) {
  const sold = device.status === 'SOLD';
  return `<span class="device-status ${sold ? 'sold' : 'available'}">${sold ? 'Đã bán' : 'Còn kho'}</span>`;
}

function renderDevices() {
  const tableBody = document.querySelector('.admin-table tbody');
  const countEl = document.getElementById('deviceCount');
  if (countEl) countEl.textContent = `${devices.length} thiết bị`;
  if (!tableBody) return;

  if (!devices.length) {
    tableBody.innerHTML = '<tr><td colspan="6" style="text-align:center; color:var(--muted); padding:28px;">Chưa có thiết bị trong kho</td></tr>';
    return;
  }

  tableBody.innerHTML = devices.map((device) => `
    <tr>
      <td><strong style="color:var(--text);">${device.imei}</strong></td>
      <td style="color:var(--muted);">${device.product_variant_id}</td>
      <td>${statusLabel(device)}</td>
      <td style="color:var(--muted);">${device.order_id || '-'}</td>
      <td style="color:var(--muted);">${formatDate(device.imported_at)}</td>
      <td style="color:var(--muted);">${formatDate(device.warranty_end)}</td>
    </tr>
  `).join('');
}

function renderLookup(device) {
  const result = document.getElementById('deviceLookupResult');
  if (!result) return;

  if (!device) {
    result.innerHTML = '<span>Không tìm thấy IMEI trong kho.</span>';
    return;
  }

  result.innerHTML = `
    <div><strong>IMEI:</strong> ${device.imei}</div>
    <div><strong>Mã biến thể:</strong> ${device.product_variant_id}</div>
    <div><strong>Trạng thái:</strong> ${device.status === 'SOLD' ? 'Đã bán' : 'Còn kho'}</div>
    <div><strong>Đơn hàng:</strong> ${device.order_id || '-'}</div>
    <div><strong>Bảo hành đến:</strong> ${formatDate(device.warranty_end)}</div>
  `;
}

async function importDevices(event) {
  event.preventDefault();

  const variantIdText = document.getElementById('variantId')?.value.trim();
  const variantId = Number(variantIdText) || variantIdText;
  const imeis = splitImeis(document.getElementById('imeiListInput')?.value);

  if (!variantId || !imeis.length) {
    alert('Vui lòng nhập mã biến thể và ít nhất một IMEI.');
    return;
  }

  const uniqueImeis = Array.from(new Set(imeis.map((imei) => imei.toUpperCase())));
  if (uniqueImeis.length !== imeis.length) {
    alert('Danh sách IMEI đang bị trùng.');
    return;
  }

  const existed = uniqueImeis.find((imei) => devices.some((device) => device.imei.toUpperCase() === imei));
  if (existed) {
    alert(`IMEI ${existed} đã tồn tại trong kho.`);
    return;
  }

  const today = new Date().toISOString().slice(0, 10);
  const importedDevices = uniqueImeis.map((imei) => ({
      imei,
      product_variant_id: variantId,
      status: 'AVAILABLE',
      imported_at: today,
      warranty_months: 12
    }));

  if (useDevicesApi()) {
    try {
      const response = await HTApi.admin.devices.import({
        product_variant_id: variantId,
        imei_list: uniqueImeis
      });
      const apiDevices = Array.isArray(response?.devices) ? response.devices.map(HTApi.mapDevice) : importedDevices;
      devices = [...apiDevices, ...devices];
    } catch (error) {
      alert(error.message || 'Không nhập được IMEI qua API.');
      return;
    }
  } else {
    devices = [...importedDevices, ...devices];
  }

  saveDevices();
  renderDevices();
  event.currentTarget.reset();
  alert('Đã nhập thiết bị vào kho dùng thử.');
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

  renderLookup(devices.find((device) => device.imei.toUpperCase() === value));
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
