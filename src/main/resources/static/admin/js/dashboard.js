/**
 * Dashboard page script
 * Handles dashboard-specific interactions, sidebar, and chart initialization
 */

// ========== SIDEBAR & COMMON ==========
function initCommonUI() {
  const sidebar = document.getElementById('sidebar');
  const mainContent = document.getElementById('mainContent');
  const toggleBtn = document.getElementById('sidebarToggle');

  if (sidebar && mainContent && toggleBtn) {
    const COLLAPSED_KEY = 'ht_admin_sidebar_collapsed';
    if (localStorage.getItem(COLLAPSED_KEY) === '1') {
      sidebar.classList.add('collapsed');
      mainContent.classList.add('expanded');
    }
    toggleBtn.addEventListener('click', () => {
      const isCollapsed = sidebar.classList.toggle('collapsed');
      mainContent.classList.toggle('expanded', isCollapsed);
      localStorage.setItem(COLLAPSED_KEY, isCollapsed ? '1' : '0');
    });
  }

  const dateEl = document.getElementById('currentDate');
  if (dateEl) {
    const now = new Date();
    dateEl.textContent = now.toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  }

  const logoutBtn = document.querySelector('.logout a');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', (e) => {
      e.preventDefault();
      localStorage.removeItem('jwt_token');
      localStorage.removeItem('user_role');
      window.location.href = '../login.html';
    });
  }
}

// ========== REVENUE CHART INITIALIZATION ==========
function initRevenueChart() {
  const ctx = document.getElementById('revenueChart');
  if (!ctx) {
    console.warn('Revenue chart element not found');
    return;
  }

  new Chart(ctx.getContext('2d'), {
    type: 'bar',
    data: {
      labels: ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'CN'],
      datasets: [
        {
          label: 'Doanh thu',
          data: [120, 190, 150, 220, 180, 250, 300],
          backgroundColor: (ctx) => {
            const g = ctx.chart.ctx.createLinearGradient(0, 0, 0, 260);
            g.addColorStop(0, 'rgba(229,0,0,0.85)');
            g.addColorStop(1, 'rgba(229,0,0,0.25)');
            return g;
          },
          borderRadius: 6,
          borderSkipped: false,
          maxBarThickness: 40,
        },
        {
          label: 'Tuần trước',
          data: [100, 160, 130, 190, 160, 210, 270],
          backgroundColor: 'rgba(255,255,255,0.06)',
          borderRadius: 6,
          borderSkipped: false,
          maxBarThickness: 40,
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
            label: ctx => ` ${ctx.parsed.y}M ₫`
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          grid: { color: 'rgba(255,255,255,0.05)' },
          ticks: { color: '#666', callback: v => v + 'M' }
        },
        x: {
          grid: { display: false },
          ticks: { color: '#666' }
        }
      }
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  initCommonUI();
  initRevenueChart();
  console.log('Dashboard loaded');
});
