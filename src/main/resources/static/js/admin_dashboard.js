 // ===== CONSTANTS =====
const API_BASE = 'http://localhost:8080';
const API_REVENUE = `${API_BASE}/api/admin/reports/revenue`;
const API_TOP_PRODUCTS = `${API_BASE}/api/admin/reports/top-products`;

// ===== AUTH HELPERS =====
function getAccessToken() {
    return localStorage.getItem('accessToken');
}

function getAuthHeaders() {
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAccessToken()}`
    };
}

function checkAdminAuth() {
    const token = getAccessToken();
    const userInfo = localStorage.getItem('userInfo');
    if (!token || !userInfo) {
        window.location.href = 'login.html';
        return false;
    }
    try {
        const data = JSON.parse(userInfo);
        const role = data.user ? data.user.role : data.role;
        if (role !== 'ADMIN') {
            window.location.href = 'login.html';
            return false;
        }
        // Update admin profile in sidebar
        const nameEl = document.querySelector('.admin-name');
        const avatarEl = document.querySelector('.admin-avatar');
        const uname = data.user ? data.user.username : data.username;
        if (nameEl && uname) nameEl.textContent = uname;
        if (avatarEl && uname) avatarEl.textContent = uname.charAt(0).toUpperCase();
    } catch (e) {
        window.location.href = 'login.html';
        return false;
    }
    return true;
}

function adminLogout() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('userInfo');
    window.location.href = 'login.html';
}

// ===== TOAST =====
function showToast(message, type = 'success') {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        document.body.appendChild(container);
    }
    const toast = document.createElement('div');
    toast.classList.add('toast-msg', type);
    toast.textContent = message;
    container.appendChild(toast);
    setTimeout(() => {
        toast.classList.add('fade-out');
        setTimeout(() => toast.remove(), 400);
    }, 3000);
}

// ===== FORMAT HELPERS =====
function formatCurrency(value) {
    if (value === null || value === undefined) return '--';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
}

function formatNumber(value) {
    if (value === null || value === undefined) return '--';
    return new Intl.NumberFormat('vi-VN').format(value);
}

// ===== SIDEBAR =====
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const main = document.querySelector('.main-content');
    if (window.innerWidth <= 768) {
        sidebar.classList.toggle('mobile-open');
    } else {
        sidebar.classList.toggle('collapsed');
        main.classList.toggle('expanded');
    }
}

// ===== CHART INSTANCE =====
let revenueChartInstance = null;

// ===== LOAD REVENUE REPORT =====
async function loadRevenueReport() {
    const period = document.getElementById('filter-period').value;
    const from = document.getElementById('filter-from').value;
    const to = document.getElementById('filter-to').value;
    const status = document.getElementById('filter-status').value;

    const params = new URLSearchParams();
    params.set('period', period);
    if (from) params.set('from', from);
    if (to) params.set('to', to);
    if (status) params.set('order_status', status);

    const loadingEl = document.getElementById('chart-loading');
    if (loadingEl) loadingEl.classList.remove('hidden');

    try {
        const response = await fetch(`${API_REVENUE}?${params.toString()}`, {
            method: 'GET',
            headers: getAuthHeaders()
        });

        if (response.status === 401 || response.status === 403) {
            showToast('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.', 'error');
            setTimeout(() => { window.location.href = 'login.html'; }, 1500);
            return;
        }

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();
        updateStatCards(data);
        renderRevenueChart(data.chart || [], period);

    } catch (error) {
        console.error('Lỗi tải báo cáo doanh thu:', error);
        showToast('Không thể tải dữ liệu doanh thu.', 'error');
        // Show empty state
        updateStatCards({});
        renderRevenueChart([], period);
    } finally {
        if (loadingEl) loadingEl.classList.add('hidden');
    }
}

// ===== UPDATE STAT CARDS =====
function updateStatCards(data) {
    const totalRevenue = data.total_revenue || 0;
    const totalOrders = data.total_orders || 0;
    const totalDevices = data.total_devices_sold || 0;
    const avgOrder = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    animateValue('stat-total-revenue', formatCurrency(totalRevenue));
    animateValue('stat-total-orders', formatNumber(totalOrders));
    animateValue('stat-total-devices', formatNumber(totalDevices));
    animateValue('stat-avg-order', formatCurrency(Math.round(avgOrder)));
}

function animateValue(elementId, finalText) {
    const el = document.getElementById(elementId);
    if (!el) return;
    el.style.opacity = '0';
    el.style.transform = 'translateY(8px)';
    setTimeout(() => {
        el.textContent = finalText;
        el.style.transition = 'all .4s ease';
        el.style.opacity = '1';
        el.style.transform = 'translateY(0)';
    }, 100);
}

// ===== RENDER REVENUE CHART =====
function renderRevenueChart(chartData, period) {
    const canvas = document.getElementById('revenue-chart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    if (revenueChartInstance) {
        revenueChartInstance.destroy();
    }

    const labels = chartData.map(item => {
        if (period === 'day') return item.date;
        if (period === 'month') return item.date ? item.date.substring(0, 7) : '';
        return item.date ? item.date.substring(0, 4) : '';
    });

    const revenues = chartData.map(item => item.revenue || 0);
    const orders = chartData.map(item => item.order_count || 0);

    const gradientRevenue = ctx.createLinearGradient(0, 0, 0, 320);
    gradientRevenue.addColorStop(0, 'rgba(99, 102, 241, 0.3)');
    gradientRevenue.addColorStop(1, 'rgba(99, 102, 241, 0.01)');

    revenueChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Doanh thu (VNĐ)',
                    data: revenues,
                    backgroundColor: 'rgba(215, 0, 24, 0.6)',
                    borderColor: '#D70018',
                    borderWidth: 1,
                    borderRadius: 6,
                    yAxisID: 'y',
                    order: 2
                },
                {
                    label: 'Số đơn hàng',
                    data: orders,
                    type: 'line',
                    borderColor: '#0d9488',
                    backgroundColor: 'rgba(13, 148, 136, 0.1)',
                    pointBackgroundColor: '#0d9488',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2,
                    pointRadius: 4,
                    pointHoverRadius: 6,
                    tension: 0.4,
                    fill: false,
                    yAxisID: 'y1',
                    order: 1
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: { mode: 'index', intersect: false },
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: '#ffffff',
                    borderColor: '#e5e7eb',
                    borderWidth: 1,
                    titleColor: '#333333',
                    bodyColor: '#333333',
                    padding: 12,
                    cornerRadius: 8,
                    titleFont: { family: 'Inter', size: 13, weight: '600' },
                    bodyFont: { family: 'Inter', size: 12 },
                    callbacks: {
                        label: function(context) {
                            if (context.datasetIndex === 0) {
                                return 'Doanh thu: ' + formatCurrency(context.parsed.y);
                            }
                            return 'Số đơn: ' + formatNumber(context.parsed.y);
                        }
                    }
                }
            },
            scales: {
                x: {
                    grid: { color: 'rgba(0, 0, 0, 0.06)', drawBorder: false },
                    ticks: { color: '#888888', font: { family: 'Inter', size: 11 }, maxRotation: 45 }
                },
                y: {
                    position: 'left',
                    grid: { color: 'rgba(0, 0, 0, 0.06)', drawBorder: false },
                    ticks: {
                        color: '#888888',
                        font: { family: 'Inter', size: 11 },
                        callback: function(value) {
                            if (value >= 1e9) return (value / 1e9).toFixed(1) + ' tỷ';
                            if (value >= 1e6) return (value / 1e6).toFixed(0) + ' tr';
                            return formatNumber(value);
                        }
                    }
                },
                y1: {
                    position: 'right',
                    grid: { drawOnChartArea: false },
                    ticks: { color: '#0d9488', font: { family: 'Inter', size: 11 } }
                }
            }
        }
    });
}

// ===== LOAD TOP PRODUCTS =====
async function loadTopProducts() {
    const limit = document.getElementById('top-limit').value;
    const brand = document.getElementById('top-brand').value;
    const from = document.getElementById('filter-from').value;
    const to = document.getElementById('filter-to').value;

    const params = new URLSearchParams();
    params.set('limit', limit);
    if (brand) params.set('brand', brand);
    if (from) params.set('from', from);
    if (to) params.set('to', to);

    const podiumLoading = document.getElementById('podium-loading');
    if (podiumLoading) podiumLoading.classList.remove('hidden');

    try {
        const response = await fetch(`${API_TOP_PRODUCTS}?${params.toString()}`, {
            method: 'GET',
            headers: getAuthHeaders()
        });

        if (response.status === 401 || response.status === 403) {
            showToast('Phiên đăng nhập hết hạn.', 'error');
            setTimeout(() => { window.location.href = 'login.html'; }, 1500);
            return;
        }

        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        const data = await response.json();
        renderPodium(data);
        renderProductsTable(data);

    } catch (error) {
        console.error('Lỗi tải top sản phẩm:', error);
        showToast('Không thể tải dữ liệu top sản phẩm.', 'error');
        renderPodium([]);
        renderProductsTable([]);
    } finally {
        if (podiumLoading) podiumLoading.classList.add('hidden');
    }
}

// ===== RENDER PODIUM (TOP 3) =====
function renderPodium(products) {
    const container = document.getElementById('podium-container');
    if (!container) return;

    const top3 = products.slice(0, 3);
    if (top3.length === 0) {
        container.innerHTML = '<div style="color: var(--text-muted); font-size: 13px;">Chưa có dữ liệu.</div>';
        return;
    }

    const rankClasses = ['gold', 'silver', 'bronze'];
    const medals = ['🥇', '🥈', '🥉'];

    // Reorder for podium: [2nd, 1st, 3rd]
    const podiumOrder = top3.length >= 3 ? [top3[1], top3[0], top3[2]] : top3;
    const rankOrder = top3.length >= 3 ? [1, 0, 2] : top3.map((_, i) => i);

    let html = '';
    podiumOrder.forEach((product, idx) => {
        const actualRank = rankOrder[idx];
        html += `
        <div class="podium-item">
            <div class="podium-rank ${rankClasses[actualRank]}">${medals[actualRank]}</div>
            <div class="podium-name">${product.product_name || '--'}</div>
            <div class="podium-variant">${product.color || ''} ${product.storage_capacity ? product.storage_capacity + 'GB' : ''}</div>
            <div class="podium-stats">${formatNumber(product.units_sold)} đã bán</div>
            <div class="podium-bar">
                <span style="font-size:11px; color: var(--text-muted);">${formatCurrency(product.revenue)}</span>
            </div>
        </div>`;
    });

    container.innerHTML = html;
}

// ===== RENDER TABLE =====
function renderProductsTable(products) {
    const tbody = document.getElementById('products-table-body');
    if (!tbody) return;

    if (!products || products.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="table-empty">Chưa có dữ liệu sản phẩm.</td></tr>';
        return;
    }

    const maxUnits = Math.max(...products.map(p => p.units_sold || 0), 1);

    tbody.innerHTML = products.map(product => {
        const rank = product.rank || 0;
        const rankClass = rank <= 3 ? `rank-${rank}` : 'rank-default';
        const pct = product.percentage ? product.percentage.toFixed(1) : '0.0';
        const barWidth = ((product.units_sold || 0) / maxUnits * 100).toFixed(1);

        return `
        <tr>
            <td><span class="rank-badge ${rankClass}">${rank}</span></td>
            <td style="font-weight:500">${product.product_name || '--'}</td>
            <td>${product.brand || '--'}</td>
            <td>${product.color || ''} ${product.storage_capacity ? product.storage_capacity + 'GB' : ''}</td>
            <td>
                <div class="progress-bar-cell">
                    <span>${formatNumber(product.units_sold)}</span>
                    <div class="progress-bar"><div class="progress-fill" style="width:${barWidth}%"></div></div>
                </div>
            </td>
            <td style="white-space:nowrap">${formatCurrency(product.revenue)}</td>
            <td>${pct}%</td>
        </tr>`;
    }).join('');
}

// ===== FILTER ACTION =====
function applyReportFilter() {
    loadRevenueReport();
    loadTopProducts();
}

// ===== INIT DEFAULT DATE RANGE =====
function initDateDefaults() {
    const now = new Date();
    const year = now.getFullYear();
    const toInput = document.getElementById('filter-to');
    const fromInput = document.getElementById('filter-from');

    if (toInput) toInput.value = now.toISOString().split('T')[0];
    if (fromInput) {
        const startOfYear = new Date(year, 0, 1);
        fromInput.value = startOfYear.toISOString().split('T')[0];
    }

    // Update topbar date
    const dateEl = document.getElementById('topbar-date');
    if (dateEl) {
        dateEl.textContent = now.toLocaleDateString('vi-VN', {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
        });
    }
}

// ===== INIT =====
document.addEventListener('DOMContentLoaded', function () {
    if (!checkAdminAuth()) return;
    initDateDefaults();
    loadRevenueReport();
    loadTopProducts();
});
