/**
 * Dashboard Page JavaScript
 * Handles dashboard initialization, revenue chart, and KPI statistics
 */

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
  setupLogout();
  console.log('Dashboard page loaded successfully');
});
