const danhSachDienThoai = [
    {
        id: 1,
        ten: "iPhone 15 Pro Max",
        gia: "29.990.000₫",
        hinh: "https://cdn.tgdd.vn/Products/Images/42/305658/iphone-15-pro-max-blue-thumbnew-600x600.jpg"
    },
    {
        id: 2,
        ten: "Samsung Galaxy S24 Ultra",
        gia: "31.990.000₫",
        hinh: "https://tse1.mm.bing.net/th/id/OIP.FpxLz2z3K0uTLDDu0ZNBMgHaHc?rs=1&pid=ImgDetMain&o=7&rm=3"
    },
    {
        id: 2,
        ten: "Samsung Galaxy S24 Ultra",
        gia: "31.990.000₫",
        hinh: "https://tse1.mm.bing.net/th/id/OIP.FpxLz2z3K0uTLDDu0ZNBMgHaHc?rs=1&pid=ImgDetMain&o=7&rm=3"
    }, {
        id: 2,
        ten: "Samsung Galaxy S24 Ultra",
        gia: "31.990.000₫",
        hinh: "https://tse1.mm.bing.net/th/id/OIP.FpxLz2z3K0uTLDDu0ZNBMgHaHc?rs=1&pid=ImgDetMain&o=7&rm=3"
    }, {
        id: 2,
        ten: "Samsung Galaxy S24 Ultra",
        gia: "31.990.000₫",
        hinh: "https://tse1.mm.bing.net/th/id/OIP.FpxLz2z3K0uTLDDu0ZNBMgHaHc?rs=1&pid=ImgDetMain&o=7&rm=3"
    },
];

const khoSanPham = document.getElementById("danh-sach-sp");

if (khoSanPham) {
    danhSachDienThoai.forEach(function (item) {
        const htmlCard = `
    <div class="the-san-pham">
    <a href="product-detail.html" class="product-link"> 
        <img src="${item.hinh}" alt="${item.ten}">
        <h3>${item.ten}</h3>
    </a>

    
    <p class="gia-tien">${item.gia}</p>
        <div class="nhom-nut-mua">
            <button class="nut-them-vao-gio">Thêm vào giỏ</button>
            <button class="nut-mua">Mua hàng</button>
            </div>
    </div>
    `

        khoSanPham.insertAdjacentHTML("beforeend", htmlCard);
    });
}


document.addEventListener("DOMContentLoaded", function () {
    const headerElement = document.getElementById("header-placeholder");

    if (headerElement) {
        fetch("header.html")
            .then(function (response) {

                if (!response.ok) {
                    throw new Error("Khong tim thay Header.html");
                }
                return response.text();

            })
            .then(function (data) {
                headerElement.innerHTML = data;
            })
            .catch(function (error) {
                console.error("Loi khi tim header");
                headerElement.innerHTML = "<p>Lỗi tải thanh header</p>";
            });

    }
});