
function capNhatGiaoDienHeader() {
    const userInfoString = localStorage.getItem('userInfo');
    const dangNhapContainer = document.querySelector('.Dang-nhap');

    if (userInfoString && dangNhapContainer) {
        const userInfo = JSON.parse(userInfoString);

        dangNhapContainer.innerHTML = `
            <div class="user-menu" style="display: flex; align-items: center; gap: 10px;">
                <a href="profile.html" class="btn-header" style="display: flex; align-items: center; gap: 5px;">
                    <img src="./img/user.svg" alt="User">
                    <h3>Xin chào, ${userInfo.name || userInfo.username || 'Bạn'}</h3>
                </a>
                <button onclick="xuLyDangXuat()" class="btn-logout" style="cursor: pointer; padding: 5px 10px; background-color: #f44336; color: white; border: none; border-radius: 5px;">
                    Đăng xuất
                </button>
            </div>
        `;
    }

    // Bind search functionality
    const searchBtn = document.getElementById('search-btn');
    const searchInput = document.getElementById('search-input');

    if (searchBtn && searchInput) {
        searchBtn.addEventListener('click', function () {
            const query = searchInput.value.trim();
            if (query) {
                window.location.href = `index.html?search=${encodeURIComponent(query)}`;
            } else {
                window.location.href = 'index.html';
            }
        });

        searchInput.addEventListener('keypress', function (e) {
            if (e.key === 'Enter') {
                searchBtn.click();
            }
        });

        // Populate search input from URL if we are on a search result page
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.has('search')) {
            searchInput.value = urlParams.get('search');
        }
    }
}
document.addEventListener("DOMContentLoaded", function () {

    const headerElement = document.getElementById("header-placeholder");
    if (headerElement) {
        fetch("header.html")
            .then(function (response) {
                if (!response.ok) throw new Error("Không tìm thấy header.html");
                return response.text();
            })
            .then(function (data) {
                headerElement.innerHTML = data;
                capNhatGiaoDienHeader();
            })
            .catch(function (error) {
                console.error("Lỗi khi tải header:", error);
                headerElement.innerHTML = "<p>Lỗi tải thanh header</p>";
            });
    }

    const footerElement = document.getElementById("footer-placeholder");
    if (footerElement) {
        fetch("footer.html")
            .then(function (response) {
                if (!response.ok) throw new Error("Không tìm thấy footer.html");
                return response.text();
            })
            .then(function (data) {
                footerElement.innerHTML = data;
            })
            .catch(function (error) {
                console.error("Lỗi khi tải footer:", error);
            });
    }
});




function xuLyDangXuat() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('userInfo');


    window.location.href = 'login.html';
}

/**
 * Hàm hiển thị thông báo góc màn hình
 * @param {string} message - Nội dung thông báo
 * @param {string} type - Loại thông báo ('success', 'error', 'warning')
 */

function showToast(message, type = 'success') {
    //Kiểm tra xem đã có container chứa toast chưa, nếu chưa thì tạo
    let toastContainer = document.getElementById('toast-container');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.id = 'toast-container';
        document.body.appendChild(toastContainer);
    }

    // Tạo phần tử thông báo mới
    const toast = document.createElement('div');
    toast.classList.add('toast-msg', type);
    toast.innerText = message;

    // Đưa thông báo vào màn hình
    toastContainer.appendChild(toast);

    //  Tự động xóa thông báo sau 3 giây (3000 milliseconds)
    setTimeout(() => {
        toast.classList.add('fade-out'); // Thêm hiệu ứng mờ dần

        // Đợi hiệu ứng mờ dần chạy xong (400ms) rồi mới xóa DOM
        setTimeout(() => {
            toast.remove();
        }, 400);
    }, 3000);
}

/**
 * Hộp thoại xác nhận tùy chỉnh sử dụng Promise
 * @param {string} message - Nội dung xác nhận
 * @param {object} options - Tùy chọn (title, okText, cancelText, type)
 * @returns {Promise<boolean>}
 */
function showConfirm(message, options = {}) {
    return new Promise((resolve) => {
        const backdrop = document.createElement('div');
        backdrop.id = 'custom-confirm-backdrop';
        
        const modal = document.createElement('div');
        modal.classList.add('custom-confirm-modal');
        
        const titleText = options.title || 'Xác nhận';
        const okText = options.okText || 'Đồng ý';
        const cancelText = options.cancelText || 'Hủy';
        const type = options.type || 'warning'; // warning, danger, info
        
        modal.innerHTML = `
            <div class="confirm-header ${type}">
                <span class="confirm-icon">${type === 'danger' ? '❌' : type === 'info' ? 'ℹ️' : '⚠️'}</span>
                <h3>${titleText}</h3>
            </div>
            <div class="confirm-body">
                <p>${message}</p>
            </div>
            <div class="confirm-footer">
                <button class="btn-confirm-cancel">${cancelText}</button>
                <button class="btn-confirm-ok ${type}">${okText}</button>
            </div>
        `;
        
        backdrop.appendChild(modal);
        document.body.appendChild(backdrop);
        
        setTimeout(() => {
            backdrop.classList.add('active');
            modal.classList.add('active');
        }, 10);
        
        const close = (result) => {
            backdrop.classList.remove('active');
            modal.classList.remove('active');
            setTimeout(() => {
                backdrop.remove();
                resolve(result);
            }, 300);
        };
        
        backdrop.querySelector('.btn-confirm-cancel').addEventListener('click', () => close(false));
        backdrop.querySelector('.btn-confirm-ok').addEventListener('click', () => close(true));
        
        backdrop.addEventListener('click', (e) => {
            if (e.target === backdrop) {
                close(false);
            }
        });
    });
}

document.addEventListener("DOMContentLoaded", function () {
    const pendingToast = sessionStorage.getItem('pendingToast');
    if (pendingToast) {
        try {
            const { message, type } = JSON.parse(pendingToast);
            showToast(message, type);
        } catch (e) {
            console.error('Error parsing pending toast:', e);
        }
        sessionStorage.removeItem('pendingToast');
    }
});
