/**
 * Staff warranty lookup script
 * Mocks /api/staff/warranty/:imei from locally imported/sold devices.
 */

const WARRANTY_DEVICES_KEY = 'ht_devices';

const warrantyDefaultDevices = [
  {
    imei: '356789101234568',
    product_variant_id: 'PV1002',
    product_name: 'iPhone 15 Pro Max 256GB',
    status: 'SOLD',
    order_id: 'DH1001',
    warranty_start: '2026-04-06',
    warranty_end: '2027-04-06',
    warranty_months: 12
  }
];

let warrantyDevices = [];

function useWarrantyApi() {
  return Boolean(window.HTApi?.isEnabled());
}

function readWarrantyDevices() {
  try {
    const saved = JSON.parse(localStorage.getItem(WARRANTY_DEVICES_KEY) || 'null');
    return Array.isArray(saved) && saved.length ? saved : [...warrantyDefaultDevices];
  } catch (error) {
    return [...warrantyDefaultDevices];
  }
}

function formatDate(dateValue) {
  if (!dateValue) return '-';
  const date = new Date(`${dateValue}T00:00:00`);
  if (Number.isNaN(date.getTime())) return dateValue;
  return date.toLocaleDateString('vi-VN');
}

function isWarrantyValid(device) {
  if (!device || !device.warranty_end) return false;
  return new Date(`${device.warranty_end}T23:59:59`) >= new Date();
}

function renderWarranty(device) {
  const result = document.getElementById('warrantyResult');
  if (!result) return;

  if (!device) {
    result.innerHTML = '<div class="empty-state">Không tìm thấy IMEI trong dữ liệu thiết bị.</div>';
    return;
  }

  const valid = isWarrantyValid(device);
  const badgeClass = device.status === 'SOLD' ? (valid ? 'valid' : 'expired') : 'unknown';
  const badgeText = device.status === 'SOLD' ? (valid ? 'Còn bảo hành' : 'Hết bảo hành') : 'Chưa bán';

  result.innerHTML = `
    <div class="warranty-card">
      <div class="warranty-item"><span>IMEI</span><strong>${device.imei}</strong></div>
      <div class="warranty-item"><span>Sản phẩm</span><strong>${device.product_name || device.product_variant_id || '-'}</strong></div>
      <div class="warranty-item"><span>Đơn hàng</span><strong>${device.order_id || '-'}</strong></div>
      <div class="warranty-item"><span>Ngày bắt đầu</span><strong>${formatDate(device.warranty_start)}</strong></div>
      <div class="warranty-item"><span>Ngày hết hạn</span><strong>${formatDate(device.warranty_end)}</strong></div>
      <div class="warranty-item"><span>Trạng thái</span><strong class="warranty-badge ${badgeClass}">${badgeText}</strong></div>
    </div>
  `;
}

async function lookupWarranty() {
  const imei = document.getElementById('warrantyImei')?.value.trim().toUpperCase();
  if (!imei) {
    renderWarranty(null);
    return;
  }

  if (useWarrantyApi()) {
    try {
      renderWarranty(HTApi.mapDevice(await HTApi.staff.warranty.lookup(imei)));
      return;
    } catch (error) {
      renderWarranty(null);
      return;
    }
  }

  const device = warrantyDevices.find((item) => String(item.imei || '').toUpperCase() === imei);
  renderWarranty(device);
}

document.addEventListener('DOMContentLoaded', () => {
  initCommonUI();
  displayCurrentDate();
  highlightActivePage();
  setupLogout();
  warrantyDevices = readWarrantyDevices();
  localStorage.setItem(WARRANTY_DEVICES_KEY, JSON.stringify(warrantyDevices));

  document.getElementById('warrantyLookupBtn')?.addEventListener('click', lookupWarranty);
  document.getElementById('warrantyImei')?.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') lookupWarranty();
  });
});
