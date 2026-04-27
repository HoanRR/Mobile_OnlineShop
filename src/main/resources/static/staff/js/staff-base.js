// Common utilities and functions
const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

// Sidebar active state and logout setup
document.addEventListener("DOMContentLoaded", () => {
    let sidebarCheck = setInterval(() => {
        const sidebar = document.querySelector('.admin-sidebar');
        if (sidebar) {
            clearInterval(sidebarCheck);
            setActiveSidebar();
            setupLogout();
        }
    }, 100);
});

function setActiveSidebar() {
    const currentPath = window.location.pathname.split('/').pop() || 'dashboard.html';
    const sidebarLinks = document.querySelectorAll('.admin-sidebar ul li a');
    
    sidebarLinks.forEach(link => {
        link.parentElement.classList.remove('active');
        const href = link.getAttribute('href');
        if (currentPath.includes(href)) {
            link.parentElement.classList.add('active');
        }
    });
}

function setupLogout() {
    const icon = document.querySelector('.fa-right-from-bracket');
    if (icon && icon.closest('a')) {
        const logoutBtn = icon.closest('a');
        logoutBtn.href = '#';
        logoutBtn.onclick = function(e) {
            e.preventDefault();
            localStorage.removeItem('currentUser');
            window.location.href = '../login.html';
        };
    }
}

// Load sidebar
fetch('sidebar.html')
    .then(response => response.text())
    .then(data => {
        const container = document.getElementById('sidebar-container');
        if (container) container.innerHTML = data;
        setActiveSidebar();
        setupLogout();
    });

// Load header
fetch('header.html')
    .then(response => response.text())
    .then(data => {
        const container = document.getElementById('header-container');
        if (container) container.innerHTML = data;
    });
