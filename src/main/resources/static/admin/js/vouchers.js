/**
 * Vouchers page script
 * Mock voucher create/extend/delete while backend APIs are not connected.
 */

const VOUCHERS_STORAGE_KEY = 'ht_vouchers';

const defaultVouchers = [
  { voucher_code: 'GIAM10', code: 'GIAM10', type: 'percent', value: 10, discount_percentage: 10, minOrder: 5000000, maxUses: 100, usage_limit: 100, used: 50, start_date: '2026-04-01', end_date: '2026-04-30', expiresAt: '2026-04-30', apply_condition: { min_value: 5000000, product_variant_ids: [] } },
  { voucher_code: 'FREESHIP', code: 'FREESHIP', type: 'fixed', value: 30000, discount_percentage: 0, minOrder: 0, maxUses: 500, usage_limit: 500, used: 0, start_date: '2026-04-01', end_date: '2026-04-01', expiresAt: '2026-04-01', apply_condition: { min_value: 0, product_variant_ids: [] } }
];

let vouchers = [];

function useVouchersApi() {
  return Boolean(window.HTApi?.isEnabled());
}

function initCommonUI() {
  const sidebar = document.getElementById('sidebar');
  const mainContent = document.getElementById('mainContent');
  const toggleBtn = document.getElementById('sidebarToggle');

  if (sidebar && mainContent && toggleBtn) {
    const collapsedKey = 'ht_sidebar_collapsed';
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

function loadVouchers() {
  try {
    const saved = JSON.parse(localStorage.getItem(VOUCHERS_STORAGE_KEY) || 'null');
    vouchers = Array.isArray(saved) && saved.length ? saved : [...defaultVouchers];
  } catch (error) {
    vouchers = [...defaultVouchers];
  }

  saveVouchers();
}

function saveVouchers() {
  localStorage.setItem(VOUCHERS_STORAGE_KEY, JSON.stringify(vouchers));
}

function normalizeText(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

function formatCurrency(amount) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    minimumFractionDigits: 0
  }).format(Number(amount) || 0);
}

function formatDate(dateValue) {
  const date = new Date(`${dateValue}T00:00:00`);
  if (Number.isNaN(date.getTime())) return dateValue;
  return date.toLocaleDateString('vi-VN');
}

function addDays(date, days) {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + days);
  return copy.toISOString().slice(0, 10);
}

function voucherCode(voucher) {
  return voucher.voucher_code || voucher.code || '';
}

function voucherEndDate(voucher) {
  return voucher.end_date || voucher.expiresAt || '';
}

function voucherUsageLimit(voucher) {
  return Number(voucher.usage_limit ?? voucher.maxUses ?? 0);
}

function voucherMinOrder(voucher) {
  return Number(voucher.apply_condition?.min_value ?? voucher.minOrder ?? 0);
}

function renderVouchers() {
  const tableBody = document.querySelector('.admin-table tbody');
  if (!tableBody) return;

  if (!vouchers.length) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="7" style="text-align:center; color:var(--muted); padding:28px;">Ch\u01b0a c\u00f3 m\u00e3 gi\u1ea3m gi\u00e1</td>
      </tr>
    `;
    return;
  }

  tableBody.innerHTML = vouchers.map((voucher) => {
    const code = voucherCode(voucher);
    const expiresAt = voucherEndDate(voucher);
    const usageLimit = voucherUsageLimit(voucher);
    const minValue = voucherMinOrder(voucher);
    const expired = new Date(`${expiresAt}T23:59:59`) < new Date();
    const discount = voucher.type === 'percent' ? `${voucher.value}%` : formatCurrency(voucher.value);
    const minOrder = minValue > 0 ? `T\u1eeb ${formatCurrency(minValue)}` : 'M\u1ed7i \u0111\u01a1n h\u00e0ng';
    const badge = expired
      ? '<span class="badge-expired">\u0110\u00e3 h\u1ebft h\u1ea1n</span>'
      : '<span class="badge-active">\u0110ang ho\u1ea1t \u0111\u1ed9ng</span>';

    return `
      <tr>
        <td><strong style="color:var(--red); font-size:16px; background:var(--red-glow); padding:4px 8px; border-radius:6px; border:1px dashed var(--red);">${code}</strong></td>
        <td style="color:var(--green); font-weight:bold;">${discount}</td>
        <td style="color:var(--text);">${minOrder}</td>
        <td style="color:var(--muted)">${voucher.used || 0}/${usageLimit}</td>
        <td style="color:var(--muted)">${formatDate(expiresAt)}</td>
        <td>${badge}</td>
        <td>
          <div class="action-btns">
            <button class="btn-edit" data-action="extend" data-code="${code}">Gia h\u1ea1n</button>
            <button class="btn-delete" data-action="delete" data-code="${code}">X\u00f3a</button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

function openVoucherModal() {
  const modal = document.getElementById('voucherModal');
  if (modal) modal.style.display = 'flex';
}

function closeModal() {
  const modal = document.getElementById('voucherModal');
  const form = modal ? modal.querySelector('form') : null;
  if (form) form.reset();
  if (modal) modal.style.display = 'none';
}

async function handleVoucherSubmit(event) {
  event.preventDefault();

  const form = event.currentTarget;
  const code = document.getElementById('voucherCode')?.value.trim().toUpperCase() || '';
  const typeText = document.getElementById('discountType')?.value || 'Ph\u1ea7n tr\u0103m';
  const value = Number(document.getElementById('discountValue')?.value);
  const maxUses = Number(document.getElementById('usageLimit')?.value);
  const minOrder = Number(document.getElementById('minOrder')?.value || 0);
  const startDate = document.getElementById('startDate')?.value || '';
  const expiresAt = document.getElementById('endDate')?.value || '';
  const productVariantIds = String(document.getElementById('productVariantIds')?.value || '')
    .split(/[\s,;]+/)
    .map((value) => value.trim())
    .filter(Boolean)
    .map((value) => Number(value) || value);
  const type = normalizeText(typeText).includes('phan tram') ? 'percent' : 'fixed';

  if (!code || value <= 0 || maxUses <= 0 || minOrder < 0) {
    alert('Vui l\u00f2ng nh\u1eadp th\u00f4ng tin voucher h\u1ee3p l\u1ec7.');
    return;
  }

  if (!startDate || Number.isNaN(new Date(`${startDate}T00:00:00`).getTime())) {
    alert('Vui l\u00f2ng ch\u1ecdn ng\u00e0y b\u1eaft \u0111\u1ea7u h\u1ee3p l\u1ec7.');
    return;
  }

  if (!expiresAt || Number.isNaN(new Date(`${expiresAt}T00:00:00`).getTime())) {
    alert('Vui l\u00f2ng ch\u1ecdn h\u1ea1n s\u1eed d\u1ee5ng h\u1ee3p l\u1ec7.');
    return;
  }

  if (new Date(`${startDate}T00:00:00`) > new Date(`${expiresAt}T00:00:00`)) {
    alert('H\u1ea1n s\u1eed d\u1ee5ng ph\u1ea3i sau ng\u00e0y b\u1eaft \u0111\u1ea7u.');
    return;
  }

  if (vouchers.some((voucher) => voucherCode(voucher) === code)) {
    alert('M\u00e3 voucher n\u00e0y \u0111\u00e3 t\u1ed3n t\u1ea1i.');
    return;
  }

  const payload = {
    voucher_code: code,
    discount_percentage: type === 'percent' ? value : 0,
    start_date: `${startDate}T00:00:00`,
    end_date: `${expiresAt}T23:59:59`,
    usage_limit: maxUses,
    apply_condition: {
      min_value: minOrder,
      product_variant_ids: productVariantIds
    }
  };

  let apiVoucher = null;
  if (useVouchersApi()) {
    try {
      apiVoucher = await HTApi.admin.vouchers.create(payload);
    } catch (error) {
      alert(error.message || 'Không tạo được voucher qua API.');
      return;
    }
  }

  vouchers.unshift({
    voucher_id: Date.now(),
    ...(apiVoucher || {}),
    voucher_code: code,
    code,
    type,
    value,
    discount_percentage: type === 'percent' ? value : 0,
    minOrder,
    maxUses,
    usage_limit: maxUses,
    used: 0,
    start_date: startDate,
    end_date: expiresAt,
    expiresAt,
    apply_condition: {
      min_value: minOrder,
      product_variant_ids: productVariantIds
    }
  });

  saveVouchers();
  renderVouchers();
  closeModal();
  alert(useVouchersApi() ? '\u0110\u00e3 t\u1ea1o voucher qua API.' : '\u0110\u00e3 th\u00eam voucher m\u1edbi.');
}

async function extendVoucher(code) {
  const voucher = vouchers.find((item) => voucherCode(item) === code);
  if (!voucher) return;

  const nextDate = prompt('Nh\u1eadp h\u1ea1n s\u1eed d\u1ee5ng m\u1edbi (yyyy-mm-dd):', voucherEndDate(voucher));
  if (nextDate === null) return;

  if (!/^\d{4}-\d{2}-\d{2}$/.test(nextDate) || Number.isNaN(new Date(`${nextDate}T00:00:00`).getTime())) {
    alert('Ng\u00e0y h\u1ebft h\u1ea1n kh\u00f4ng h\u1ee3p l\u1ec7.');
    return;
  }

  const nextUsage = prompt('Nh\u1eadp s\u1ed1 l\u01b0\u1ee3t d\u00f9ng m\u1edbi:', voucherUsageLimit(voucher));
  if (nextUsage === null) return;

  const usageLimit = Number(nextUsage);
  if (!Number.isFinite(usageLimit) || usageLimit <= 0) {
    alert('S\u1ed1 l\u01b0\u1ee3t d\u00f9ng kh\u00f4ng h\u1ee3p l\u1ec7.');
    return;
  }

  if (useVouchersApi()) {
    try {
      await HTApi.admin.vouchers.extend(voucher.voucher_id || voucher.voucherId || code, {
        end_date: `${nextDate}T23:59:59`,
        usage_limit: usageLimit
      });
    } catch (error) {
      alert(error.message || 'Không gia hạn được voucher qua API.');
      return;
    }
  }

  voucher.expiresAt = nextDate;
  voucher.end_date = nextDate;
  voucher.maxUses = usageLimit;
  voucher.usage_limit = usageLimit;
  saveVouchers();
  renderVouchers();
}

function deleteVoucher(code) {
  if (!confirm(`X\u00f3a voucher ${code}?`)) return;
  vouchers = vouchers.filter((voucher) => voucherCode(voucher) !== code);
  saveVouchers();
  renderVouchers();
}

function initVoucherPageEvents() {
  const addButton = document.querySelector('.page-body .btn-add');
  const modal = document.getElementById('voucherModal');
  const form = modal ? modal.querySelector('form') : null;
  const tableBody = document.querySelector('.admin-table tbody');

  if (addButton) {
    addButton.onclick = null;
    addButton.addEventListener('click', openVoucherModal);
  }

  if (form) form.addEventListener('submit', handleVoucherSubmit);

  if (modal) {
    modal.querySelectorAll('button').forEach((button) => {
      const label = normalizeText(button.textContent);
      button.onclick = null;
      if (label.includes('huy') || button.textContent.trim() === '\u00d7') {
        button.addEventListener('click', closeModal);
      }
    });

    modal.addEventListener('click', (event) => {
      if (event.target === modal) closeModal();
    });
  }

  if (tableBody) {
    tableBody.addEventListener('click', (event) => {
      const button = event.target.closest('button[data-action]');
      if (!button) return;

      if (button.dataset.action === 'extend') {
        extendVoucher(button.dataset.code);
      } else if (button.dataset.action === 'delete') {
        deleteVoucher(button.dataset.code);
      }
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  initCommonUI();
  loadVouchers();
  initVoucherPageEvents();
  renderVouchers();
});
