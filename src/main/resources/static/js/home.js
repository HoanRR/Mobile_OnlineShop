
const API_URL = 'http://localhost:8080/api/products';

async function loadPhones() {
    try {
        const urlParams = new URLSearchParams(window.location.search);
        const searchQuery = urlParams.get('search');
        const brandQuery = urlParams.get('brand');
        
        let url = API_URL;
        const mainContent = document.getElementById('khu-vuc-trang-chu');
        const sliderWrapper = document.querySelector('.slider-wrapper');
        const categorySection = document.getElementById('home-categories');

        if (searchQuery) {
            url += `?keyword=${encodeURIComponent(searchQuery)}`;
            
            if (sliderWrapper) sliderWrapper.style.display = 'none';
            if (categorySection) categorySection.style.display = 'none';
            
            const searchTitle = document.createElement('h2');
            searchTitle.style.textAlign = 'center';
            searchTitle.style.margin = '20px 0';
            searchTitle.innerText = `Kết quả tìm kiếm cho: "${searchQuery}"`;
            mainContent.insertBefore(searchTitle, document.querySelector('.product-section'));
        } else if (brandQuery) {
            url += `?brand=${encodeURIComponent(brandQuery)}`;
            
            if (sliderWrapper) sliderWrapper.style.display = 'none';
            if (categorySection) categorySection.style.display = 'none';
            
            const brandTitle = document.createElement('h2');
            brandTitle.style.textAlign = 'center';
            brandTitle.style.margin = '20px 0';
            brandTitle.innerText = `Sản phẩm thương hiệu: ${brandQuery}`;
            mainContent.insertBefore(brandTitle, document.querySelector('.product-section'));
        }

        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`Lỗi HTTP: ${response.status}`);
        }
        const responseData = await response.json();
        allProducts = responseData.data;

        if (allProducts && allProducts.length > 0) {
            renderPhonesToHTML(allProducts);
        } else {
            document.getElementById("danh-sach-sp").innerHTML = "<p style='text-align:center; width:100%;'>Không tìm thấy sản phẩm nào.</p>";
        }

    } catch (error) {
        console.error("Không thể kết nối tới Backend:", error);
        document.getElementById('slider-wrapper').innerHTML = 
            "<p style='color:red'>Lỗi kết nối máy chủ. Vui lòng thử lại sau.</p>";
    }
}





document.addEventListener("DOMContentLoaded", function() {
    const track = document.querySelector('.slider-track');
    if(!track) return; 

    const slides = Array.from(track.children);
    const nextButton = document.getElementById('btn-next');
    const prevButton = document.getElementById('btn-prv');
    const dotsNav = document.querySelector('.slider-dots');
    const dots = Array.from(dotsNav.children);

    let currentIndex = 0;
    const slideIntervalTime = 5000; // thoi gian chuyen 5000 mili giay
    let slideTimer;

    function moveToSlide(index) {
        if (index < 0) index = slides.length - 1;
        if (index >= slides.length) index = 0;

        track.style.transform = 'translateX(-' + index * 100 + '%)';
        
        dots.forEach(d => d.classList.remove('active'));
        dots[index].classList.add('active');
        
        currentIndex = index;
    }

    if(nextButton) nextButton.addEventListener('click', () => { moveToSlide(currentIndex + 1); resetTimer(); });
    if(prevButton) prevButton.addEventListener('click', () => { moveToSlide(currentIndex - 1); resetTimer(); });

    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            moveToSlide(index);
            resetTimer();
        });
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



function renderPhonesToHTML(phones){
    const khoSanPham = document.getElementById("danh-sach-sp");

    phones.forEach(function (item) {
        const htmlCard = `
    <div class="the-san-pham">
    <a href="product-detail.html?id=${item.product_id}" class="product-link"> 
        <img src="${item.product_image_link}" alt="${item.product_name}">
        <h3>${item.product_name}</h3>
    </a>

    <div class="gia-tien">
    <p class="gia-hien-tai">${item.min_price}</p><p class="gia-cu">${item.min_price}</p>
    </div>
        <div class="nhom-nut-mua">
            <button class="nut-them-vao-gio" onclick="themVaoGioHang(${item.product_id})">Thêm vào giỏ</button>
            <a href="product-detail.html?id=${item.product_id}"><button class="nut-mua">Mua hàng</button></a>
            </div>
    </div>
    `

        khoSanPham.insertAdjacentHTML("beforeend", htmlCard);
    });
}







function themVaoGioHang(idSanPham) {
    let gioHang = JSON.parse(localStorage.getItem('cart')) || [];

    const sanPham = danhSachDienThoai.find(sp => sp.id === idSanPham);
    
    if (!sanPham) {
        alert("Có lỗi xảy ra, không tìm thấy sản phẩm!");
        return;
    }

    const sanPhamDaCo = gioHang.find(item => item.id === idSanPham);

    if (sanPhamDaCo) {
        sanPhamDaCo.quantity += 1;
    } else {
        gioHang.push({
            id: sanPham.id,
            ten: sanPham.ten,
            giaHienTai: sanPham.giaHienTai,
            anh: sanPham.anh,
            quantity: 1
        });
    }
    

    localStorage.setItem('cart', JSON.stringify(gioHang));


}

window.addEventListener('DOMContentLoaded', loadPhones);