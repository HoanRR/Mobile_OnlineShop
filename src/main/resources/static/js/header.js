// Header management script
/**
 * Initialize header authentication and UI
 */
function initializeHeaderAuth() {
    updateHeaderAuth();
    setupDropdownMenu();
    setupLogout();
    updateCartCount();
}

/**
 * Update header based on login status
 */
function updateHeaderAuth() {
    const accessToken = localStorage.getItem('accessToken');
    const currentUser = localStorage.getItem('currentUser');

    const notLoggedInEl = document.getElementById('not-logged-in');
    const loggedInEl = document.getElementById('logged-in');
    const userNameEl = document.getElementById('user-name');

    if (accessToken && currentUser) {
        // User is logged in
        try {
            const user = JSON.parse(currentUser);
            const displayName = user.full_name || user.username || 'Tài khoản';

            if (userNameEl) {
                userNameEl.textContent = displayName;
            }

            if (notLoggedInEl) {
                notLoggedInEl.style.display = 'none';
            }
            if (loggedInEl) {
                loggedInEl.style.display = 'block';
            }
        } catch (error) {
            console.error('Lỗi khi parse user data:', error);
            showNotLoggedIn();
        }
    } else {
        // User is not logged in
        showNotLoggedIn();
    }
}

/**
 * Show not logged in UI
 */
function showNotLoggedIn() {
    const notLoggedInEl = document.getElementById('not-logged-in');
    const loggedInEl = document.getElementById('logged-in');

    if (notLoggedInEl) {
        notLoggedInEl.style.display = 'flex';
    }
    if (loggedInEl) {
        loggedInEl.style.display = 'none';
    }
}

/**
 * Setup dropdown menu toggle
 */
function setupDropdownMenu() {
    const userMenuBtn = document.getElementById('user-menu-btn');
    const userDropdown = document.getElementById('user-dropdown');

    if (userMenuBtn && userDropdown) {
        userMenuBtn.addEventListener('click', function (e) {
            e.stopPropagation();
            userDropdown.classList.toggle('show');
            userMenuBtn.classList.toggle('active');
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', function (e) {
            if (!e.target.closest('.user-profile')) {
                userDropdown.classList.remove('show');
                userMenuBtn.classList.remove('active');
            }
        });

        // Close dropdown when clicking a menu item
        const dropdownItems = userDropdown.querySelectorAll('.dropdown-item:not(.logout-item)');
        dropdownItems.forEach(item => {
            item.addEventListener('click', function () {
                userDropdown.classList.remove('show');
                userMenuBtn.classList.remove('active');
            });
        });
    }
}

/**
 * Setup logout functionality
 */
function setupLogout() {
    const logoutBtn = document.getElementById('logout-btn');

    if (logoutBtn) {
        logoutBtn.addEventListener('click', async function (e) {
            e.preventDefault();

            const accessToken = localStorage.getItem('accessToken');

            try {
                // Call logout API
                const response = await fetch('http://localhost:8080/api/auth/logout', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${accessToken}`
                    }
                });

                if (response.ok || response.status === 401 || response.status === 403) {
                    // Clear local storage
                    localStorage.removeItem('accessToken');
                    localStorage.removeItem('refreshToken');
                    localStorage.removeItem('currentUser');
                    localStorage.removeItem('userId');
                    localStorage.removeItem('userRole');
                    localStorage.removeItem('cart');

                    // Update header
                    updateHeaderAuth();

                    // Redirect to home
                    setTimeout(() => {
                        window.location.href = 'index.html';
                    }, 500);
                } else {
                    alert('Có lỗi xảy ra khi đăng xuất');
                }
            } catch (error) {
                console.error('Lỗi khi đăng xuất:', error);

                // Still clear local storage and redirect even if API call fails
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                localStorage.removeItem('currentUser');
                localStorage.removeItem('userId');
                localStorage.removeItem('userRole');
                localStorage.removeItem('cart');

                updateHeaderAuth();

                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 500);
            }
        });
    }
}

/**
 * Update cart count in header
 */
function updateCartCount() {
    const cartCountEl = document.getElementById('cart-count');
    if (cartCountEl) {
        try {
            const cart = JSON.parse(localStorage.getItem('cart')) || [];
            const count = cart.length;

            if (count > 0) {
                cartCountEl.textContent = count;
                cartCountEl.style.display = 'flex';
            } else {
                cartCountEl.style.display = 'none';
            }
        } catch (error) {
            console.error('Lỗi khi cập nhật giỏ hàng:', error);
        }
    }
}

/**
 * Refresh header auth when storage changes (in other tabs)
 */
window.addEventListener('storage', function (e) {
    if (e.key === 'accessToken' || e.key === 'currentUser') {
        updateHeaderAuth();
    }
    if (e.key === 'cart') {
        updateCartCount();
    }
});

// Initialize header when page loads or header is dynamically added
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeHeaderAuth);
} else {
    // If DOMContentLoaded already fired, initialize immediately
    setTimeout(initializeHeaderAuth, 100);
}
