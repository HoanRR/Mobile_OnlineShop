/**
 * Dashboard page script
 * Handles dashboard chart and meaningful navigation.
 */

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

function normalizeText(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

let revenueChartInstance = null;

function useDashboardApi() {
  return Boolean(window.HTApi?.isEnabled());
}

function formatNumber(value) {
  return new Intl.NumberFormat('vi-VN').format(Number(value) || 0);
}

function formatMoneyShort(value) {
  const amount = Number(value) || 0;
  if (amount >= 1000000000) {
    return `${formatNumber(Math.round(amount / 1000000))}M \u20ab`;
  }
  if (amount >= 1000000) {
    return `${formatNumber(Math.round(amount / 1000000))}M \u20ab`;
  }
  return `${formatNumber(amount)} \u20ab`;
}

function formatMoney(value) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    minimumFractionDigits: 0
  }).format(Number(value) || 0);
}

function dashboardDateRange(days = 7) {
  const to = new Date();
  const from = new Date();
  from.setDate(to.getDate() - days + 1);
  return {
    from: from.toISOString().slice(0, 10),
    to: to.toISOString().slice(0, 10)
  };
}

function dashboardStatusKey(value) {
  const raw = String(value || '').trim();
  const upper = raw.toUpperCase();
  const normalized = normalizeText(raw);

  if (['WAIT', 'CONFIRMED', 'PROCESSING', 'SHIPPING', 'DELIVERED', 'RETURNED'].includes(upper)) return upper;
  if (normalized.includes('cho xac nhan')) return 'WAIT';
  if (normalized.includes('dang giao')) return 'SHIPPING';
  if (normalized.includes('da giao') || normalized.includes('hoan thanh')) return 'DELIVERED';
  if (normalized.includes('hoan tra') || normalized.includes('huy')) return 'RETURNED';
  return upper || 'WAIT';
}

function dashboardStatusInfo(status) {
  const key = dashboardStatusKey(status);
  const items = {
    WAIT: { label: 'Ch\u1edd x\u00e1c nh\u1eadn', className: 'badge-wait' },
    CONFIRMED: { label: '\u0110\u00e3 x\u00e1c nh\u1eadn', className: 'badge-wait' },
    PROCESSING: { label: '\u0110ang x\u1eed l\u00fd', className: 'badge-wait' },
    SHIPPING: { label: '\u0110ang giao', className: 'badge-shipping' },
    DELIVERED: { label: '\u0110\u00e3 giao', className: 'badge-done' },
    RETURNED: { label: 'Ho\u00e0n tr\u1ea3', className: 'badge-cancel' }
  };
  return items[key] || items.WAIT;
}

function setKpiValue(index, value, trendText) {
  const card = document.querySelectorAll('.kpi-card')[index];
  if (!card) return;

  const valueEl = card.querySelector('.kpi-value');
  const trendEl = card.querySelector('.kpi-trend');
  if (valueEl) valueEl.textContent = value;
  if (trendEl && trendText) trendEl.innerHTML = trendText;
}

function renderTopProducts(products) {
  const tbody = document.querySelector('.top-table tbody');
  if (!tbody || !products.length) return;

  tbody.innerHTML = products.slice(0, 5).map((product, index) => {
    const rank = Number(product.rank || index + 1);
    const name = product.product_name || product.productName || product.name || '-';
    const sold = Number(product.units_sold ?? product.unitsSold ?? product.sold ?? 0);
    const rankClass = rank === 1 ? 'rank-1' : rank === 2 ? 'rank-2' : rank === 3 ? 'rank-3' : 'rank-other';

    return `
      <tr>
        <td><span class="rank-badge ${rankClass}">${rank}</span></td>
        <td class="prod-name">${name}</td>
        <td class="sold-count">${formatNumber(sold)}</td>
      </tr>
    `;
  }).join('');
}

function renderRecentOrders(orders) {
  const panel = Array.from(document.querySelectorAll('.bottom-row .panel'))
    .find((item) => item.querySelector('.order-row'));
  if (!panel || !orders.length) return;

  panel.querySelectorAll('.order-row').forEach((row) => row.remove());
  orders.slice(0, 4).forEach((order) => {
    const status = dashboardStatusInfo(order.order_status || order.status);
    panel.insertAdjacentHTML('beforeend', `
      <div class="order-row">
        <div>
          <div class="order-id">#${order.id || order.order_id || ''}</div>
          <div class="order-customer">${order.customerName || order.receiver_name || '-'}</div>
        </div>
        <div class="order-amt">${formatMoney(order.total_amount ?? order.total)}</div>
        <span class="badge ${status.className}">${status.label}</span>
      </div>
    `);
  });
}

function renderQuickStats(orders) {
  const values = document.querySelectorAll('.quick-stat .qs-val');
  if (values.length < 3 || !orders.length) return;

  const today = new Date().toISOString().slice(0, 10);
  const waitCount = orders.filter((order) => dashboardStatusKey(order.order_status || order.status) === 'WAIT').length;
  const shippingCount = orders.filter((order) => dashboardStatusKey(order.order_status || order.status) === 'SHIPPING').length;
  const doneToday = orders.filter((order) => {
    const date = String(order.date || order.order_date || order.orderDate || '').slice(0, 10);
    return dashboardStatusKey(order.order_status || order.status) === 'DELIVERED' && date === today;
  }).length;

  values[0].textContent = formatNumber(waitCount);
  values[1].textContent = formatNumber(shippingCount);
  values[2].textContent = formatNumber(doneToday);
}

function updateRevenueChart(chartItems) {
  if (!revenueChartInstance || !Array.isArray(chartItems) || !chartItems.length) return;

  revenueChartInstance.data.labels = chartItems.map((item) => {
    const date = new Date(item.date);
    if (Number.isNaN(date.getTime())) return item.date || '';
    return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
  });
  revenueChartInstance.data.datasets[0].data = chartItems.map((item) => Math.round((Number(item.revenue) || 0) / 1000000));
  revenueChartInstance.update();
}

async function loadDashboardApiData() {
  if (!useDashboardApi()) return;

  const range = dashboardDateRange(7);

  try {
    const revenue = await HTApi.admin.reports.revenue({
      period: 'day',
      from: range.from,
      to: range.to,
      order_status: 'DELIVERED'
    });
    setKpiValue(0, formatMoneyShort(revenue?.total_revenue ?? revenue?.totalRevenue), `<span class="up"><i class="fa-solid fa-check"></i></span> doanh thu theo API`);
    setKpiValue(1, formatNumber(revenue?.total_orders ?? revenue?.totalOrders), `<span class="up"><i class="fa-solid fa-check"></i></span> \u0111\u01a1n theo API`);
    updateRevenueChart(revenue?.chart || []);
  } catch (error) {
    console.warn('Khong tai duoc bao cao doanh thu tu API:', error);
  }

  try {
    renderTopProducts(HTApi.listData(await HTApi.admin.reports.topProducts({ limit: 5, from: range.from, to: range.to })));
  } catch (error) {
    console.warn('Khong tai duoc top san pham tu API:', error);
  }

  try {
    const orders = HTApi.listData(await HTApi.orders.list({ page: 1, limit: 100 }))
      .map(HTApi.mapOrder);
    renderRecentOrders(orders);
    renderQuickStats(orders);
  } catch (error) {
    console.warn('Khong tai duoc danh sach don hang tu API:', error);
  }

  try {
    const products = await HTApi.products.list({ page: 1, limit: 1 });
    setKpiValue(2, formatNumber(HTApi.totalCount(products)), `<span class="up"><i class="fa-solid fa-check"></i></span> s\u1ea3n ph\u1ea9m theo API`);
  } catch (error) {
    console.warn('Khong tai duoc tong san pham tu API:', error);
  }

  try {
    const customers = await HTApi.admin.users.list({ role: 'CUSTOMER', page: 1, limit: 1 });
    setKpiValue(3, formatNumber(HTApi.totalCount(customers)), `<span class="up"><i class="fa-solid fa-check"></i></span> kh\u00e1ch h\u00e0ng theo API`);
  } catch (error) {
    console.warn('Khong tai duoc tong khach hang tu API:', error);
  }
}

function initQuickStatsClickHandlers() {
  const links = [
    { status: 'WAIT', href: 'orders.html' },
    { status: 'SHIPPING', href: 'orders.html' },
    { status: 'DELIVERED', href: 'orders.html' },
    { href: 'admin-reviews.html' }
  ];

  document.querySelectorAll('.quick-stat').forEach((stat, index) => {
    stat.style.cursor = 'pointer';
    stat.addEventListener('click', () => {
      const target = links[index];
      if (!target) return;

      if (target.status) {
        sessionStorage.setItem('ht_admin_order_filter_status', target.status);
        const url = new URL(target.href, window.location.href);
        url.searchParams.set('status', target.status);
        window.location.href = url.toString();
        return;
      }

      window.location.href = target.href;
    });
  });
}

function initKPIClickHandlers() {
  document.querySelectorAll('.kpi-card').forEach((card) => {
    card.style.cursor = 'pointer';
    card.addEventListener('click', () => {
      const label = normalizeText(card.querySelector('.kpi-label')?.textContent);

      if (label.includes('doanh thu') || label.includes('don hang')) {
        window.location.href = 'orders.html';
      } else if (label.includes('san pham')) {
        window.location.href = 'products.html';
      } else if (label.includes('khach hang')) {
        window.location.href = 'users.html?role=customer';
      }
    });
  });
}

function initTopProductsClickHandlers() {
  document.querySelectorAll('.top-table tbody tr').forEach((row) => {
    row.style.cursor = 'pointer';
    row.addEventListener('click', () => {
      const productName = row.querySelector('.prod-name')?.textContent.trim() || '';
      window.location.href = `products.html?q=${encodeURIComponent(productName)}`;
    });
  });
}

function initRecentOrderClickHandlers() {
  document.querySelectorAll('.order-row').forEach((row) => {
    row.style.cursor = 'pointer';
    row.addEventListener('click', () => {
      const orderId = row.querySelector('.order-id')?.textContent.replace('#ORD-', 'DH').replace('#', '') || '';
      window.location.href = `orders.html?q=${encodeURIComponent(orderId)}`;
    });
  });
}

function initRevenueChart() {
  const canvas = document.getElementById('revenueChart');
  if (!canvas || typeof Chart === 'undefined') return;

  revenueChartInstance = new Chart(canvas.getContext('2d'), {
    type: 'bar',
    data: {
      labels: ['Th\u1ee9 2', 'Th\u1ee9 3', 'Th\u1ee9 4', 'Th\u1ee9 5', 'Th\u1ee9 6', 'Th\u1ee9 7', 'CN'],
      datasets: [
        {
          label: 'Doanh thu',
          data: [120, 190, 150, 220, 180, 250, 300],
          backgroundColor: (context) => {
            const gradient = context.chart.ctx.createLinearGradient(0, 0, 0, 260);
            gradient.addColorStop(0, 'rgba(229,0,0,0.85)');
            gradient.addColorStop(1, 'rgba(229,0,0,0.25)');
            return gradient;
          },
          borderRadius: 6,
          borderSkipped: false,
          maxBarThickness: 40
        },
        {
          label: 'Tu\u1ea7n tr\u01b0\u1edbc',
          data: [100, 160, 130, 190, 160, 210, 270],
          backgroundColor: 'rgba(255,255,255,0.06)',
          borderRadius: 6,
          borderSkipped: false,
          maxBarThickness: 40
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: { color: '#888', font: { size: 12 }, boxWidth: 12, padding: 20 }
        },
        tooltip: {
          backgroundColor: '#1c1e22',
          borderColor: '#2e3035',
          borderWidth: 1,
          titleColor: '#f0f0f2',
          bodyColor: '#9a9ba3',
          callbacks: {
            label: (context) => ` ${context.parsed.y}M \u20ab`
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          grid: { color: 'rgba(255,255,255,0.05)' },
          ticks: { color: '#666', callback: (value) => `${value}M` }
        },
        x: {
          grid: { display: false },
          ticks: { color: '#666' }
        }
      }
    }
  });
}

document.addEventListener('DOMContentLoaded', async () => {
  initCommonUI();
  initRevenueChart();
  await loadDashboardApiData();
  initKPIClickHandlers();
  initTopProductsClickHandlers();
  initQuickStatsClickHandlers();
  initRecentOrderClickHandlers();
});
