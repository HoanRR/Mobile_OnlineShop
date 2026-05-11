/**
 * Dashboard Page JavaScript
 * Handles dashboard initialization, revenue chart, and KPI statistics
 */

// ========== QUICK STATS CLICK HANDLERS ==========
function initQuickStatsClickHandlers() {
  const quickStats = document.querySelectorAll('.quick-stat');
  
  quickStats.forEach(stat => {
    stat.style.cursor = 'pointer';
    stat.addEventListener('click', () => {
      const label = stat.querySelector('.qs-label').textContent.trim();
      
      if (label.includes('Đơn cần xử lý') || label.includes('Đang vận chuyển') || label.includes('Hoàn thành')) {
        window.location.href = 'orders.html';
      } else if (label.includes('Đánh giá')) {
        window.location.href = 'reviews.html';
      }
    });
  });
}

// ========== KPI CARD CLICK HANDLERS ==========
function initKPIClickHandlers() {
  const kpiCards = document.querySelectorAll('.kpi-card');
  
  kpiCards.forEach(card => {
    card.style.cursor = 'pointer';
    card.addEventListener('click', () => {
      const label = card.querySelector('.kpi-label').textContent.trim();
      
      if (label.includes('Doanh Thu') || label.includes('Đơn Hàng')) {
        window.location.href = 'orders.html';
      } else if (label.includes('Sản phẩm')) {
        window.location.href = 'products.html';
      } else if (label.includes('Khách Hàng')) {
        window.location.href = 'products.html';
      }
    });
  });
}

// ========== TOP PRODUCTS CLICK HANDLERS ==========
function initTopProductsClickHandlers() {
  const topTable = document.querySelector('.top-table tbody');
  if (!topTable) return;
  
  const rows = topTable.querySelectorAll('tr');
  rows.forEach(row => {
    row.style.cursor = 'pointer';
    row.addEventListener('click', () => {
      window.location.href = 'products.html';
    });
  });
}

// ========== REVENUE CHART INITIALIZATION ==========
function initRevenueChart() {
  const ctx = document.getElementById('revenueChart');
  if (!ctx) {
    console.warn('Revenue chart element not found');
    return;
  }

  try {
    new Chart(ctx.getContext('2d'), {
      type: 'bar',
      data: {
        labels: ['Tuần 2', 'Tuần 3', 'Tuần 4', 'Tuần 5', 'Tuần 6', 'Tuần 7', 'CN'],
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
  } catch (e) {
    console.error('Error initializing revenue chart:', e);
  }
}

// ========== PAGE INITIALIZATION ==========
document.addEventListener('DOMContentLoaded', () => {
  initCommonUI();
  displayCurrentDate();
  highlightActivePage();
  initRevenueChart();
  initKPIClickHandlers();
  initTopProductsClickHandlers();
  initQuickStatsClickHandlers();
  setupLogout();
  console.log('Dashboard page loaded successfully');
});
