const API_URL = 'http://localhost:8080/api/products';
let allProducts = [];

// ============================================================
// Tai san pham tu API
// ============================================================
async function loadPhones() {
    try {
        const urlParams = new URLSearchParams(window.location.search);
        const searchQuery = urlParams.get('search');
        const brandQuery = urlParams.get('brand');

        let url = API_URL + '?limit=100'; // lay nhieu de loc client-side
        const mainContent = document.getElementById('khu-vuc-trang-chu');
        const sliderWrapper = document.querySelector('.slider-wrapper');
        const categorySection = document.getElementById('home-categories');
        const filterBar = document.getElementById('filter-bar');

        if (searchQuery) {
            url = `${API_URL}?keyword=${encodeURIComponent(searchQuery)}&limit=100`;
            if (sliderWrapper) sliderWrapper.style.display = 'none';
            if (categorySection) categorySection.style.display = 'none';
            if (filterBar) filterBar.style.display = 'none';

            const searchTitle = document.createElement('h2');
            searchTitle.className = 'search-result-title';
            searchTitle.innerText = `Ket qua tim kiem cho: "${searchQuery}"`;
            mainContent.insertBefore(searchTitle, document.querySelector('.product-section'));

        } else if (brandQuery) {
            url = `${API_URL}?brand=${encodeURIComponent(brandQuery)}&limit=100`;
            if (sliderWrapper) sliderWrapper.style.display = 'none';
            if (categorySection) categorySection.style.display = 'none';

            const brandSelect = document.getElementById('filter-brand');
            if (brandSelect) brandSelect.value = brandQuery;

            document.getElementById('product-section-title').innerText = `Thuong hieu: ${brandQuery}`;
        }

        const response = await fetch(url);
        if (!response.ok) throw new Error(`Loi HTTP: ${response.status}`);

        const responseData = await response.json();
        allProducts = responseData.data || [];

        applyFilters(); // render qua bo loc

    } catch (error) {
        console.error('Khong the ket noi toi Backend:', error);
        const sp = document.getElementById('danh-sach-sp');
        if (sp) sp.innerHTML = "<p style='text-align:center;color:red;'>Loi ket noi may chu. Vui long thu lai sau.</p>";
    }
}

// ============================================================
// Ap dung bo loc + sap xep (client-side)
// ============================================================
function applyFilters() {
    const brand = (document.getElementById('filter-brand')?.value || '').toLowerCase();
    const priceRange = document.getElementById('filter-price')?.value || '';
    const sortBy = document.getElementById('sort-by')?.value || 'price-asc';

    let filtered = [...allProducts];

    // Loc hang
    if (brand) {
        filtered = filtered.filter(p => (p.brand || '').toLowerCase() === brand);
    }

    // Loc gia (dung min_price)
    if (priceRange) {
        const [minP, maxP] = priceRange.split('-').map(Number);
        filtered = filtered.filter(p => {
            const price = p.min_price || 0;
            return price >= minP && price <= maxP;
        });
    }

    // Sap xep
    filtered.sort((a, b) => {
        if (sortBy === 'price-asc') return (a.min_price || 0) - (b.min_price || 0);
        if (sortBy === 'price-desc') return (b.min_price || 0) - (a.min_price || 0);
        if (sortBy === 'name-asc') return (a.product_name || '').localeCompare(b.product_name || '');
        return 0;
    });

    const container = document.getElementById('danh-sach-sp');
    container.innerHTML = '';

    if (filtered.length === 0) {
        container.innerHTML = "<p style='text-align:center;width:100%;padding:30px;color:#888;'>Khong tim thay san pham nao phu hop.</p>";
    } else {
        renderPhonesToHTML(filtered);
    }
}

function resetFilters() {
    const brand = document.getElementById('filter-brand');
    const price = document.getElementById('filter-price');
    const sort = document.getElementById('sort-by');
    if (brand) brand.value = '';
    if (price) price.value = '';
    if (sort) sort.value = 'price-asc';
    applyFilters();
}

// ============================================================
// Slider
// ============================================================
document.addEventListener("DOMContentLoaded", function () {
    const track = document.querySelector('.slider-track');
    if (!track) return;

    const slides = Array.from(track.children);
    const nextButton = document.getElementById('btn-next');
    const prevButton = document.getElementById('btn-prv');
    const dotsNav = document.querySelector('.slider-dots');
    const dots = Array.from(dotsNav.children);

    let currentIndex = 0;
    const slideIntervalTime = 5000;
    let slideTimer;

    function moveToSlide(index) {
        if (index < 0) index = slides.length - 1;
        if (index >= slides.length) index = 0;
        track.style.transform = 'translateX(-' + index * 100 + '%)';
        dots.forEach(d => d.classList.remove('active'));
        dots[index].classList.add('active');
        currentIndex = index;
    }

    if (nextButton) nextButton.addEventListener('click', () => { moveToSlide(currentIndex + 1); resetTimer(); });
    if (prevButton) prevButton.addEventListener('click', () => { moveToSlide(currentIndex - 1); resetTimer(); });

    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => { moveToSlide(index); resetTimer(); });
    });

    function startTimer() {
        slideTimer = setInterval(() => moveToSlide(currentIndex + 1), slideIntervalTime);
    }
    function resetTimer() {
        clearInterval(slideTimer);
        startTimer();
    }
    startTimer();
});

// ============================================================
// Render the-san-pham
// ============================================================
function renderPhonesToHTML(phones) {
    const khoSanPham = document.getElementById("danh-sach-sp");

    phones.forEach(function (item) {
        const price = (item.min_price || 0).toLocaleString('vi-VN') + 'đ';
        const htmlCard = `
    <div class="the-san-pham">
    <a href="product-detail.html?id=${item.product_id}" class="product-link">
        <img src="${item.product_image_link}" alt="${item.product_name}"
             onerror="this.src='https://upload.wikimedia.org/wikipedia/commons/1/14/No_Image_Available.jpg'">
        <h3>${item.product_name}</h3>
    </a>
    <div class="gia-tien">
        <p class="gia-hien-tai">${price}</p>
    </div>
    <div class="nhom-nut-mua">
        <a href="product-detail.html?id=${item.product_id}"><button class="nut-them-vao-gio">Xem chi tiet</button></a>
        <a href="product-detail.html?id=${item.product_id}"><button class="nut-mua">Mua hang</button></a>
    </div>
    </div>
    `;
        khoSanPham.insertAdjacentHTML("beforeend", htmlCard);
    });
}

window.addEventListener('DOMContentLoaded', loadPhones);
window.applyFilters = applyFilters;
window.resetFilters = resetFilters;