

const danhSachDienThoai = [
    {
        id: 1,
        ten: "iPhone 15 Pro Max",
        giaHienTai: "29.990.000đ",
        giaCu: "34.990.000đ",
        anh: "https://tse3.mm.bing.net/th/id/OIP.v2gZ9YqRjr841Ch31Q18GAHaHa?rs=1&pid=ImgDetMain&o=7&rm=3", 
        thongSo: {
            Chip : "A17Pro", Ram : "8GB", boNho : "256GB", manHinh : "Super Retina XDR", camera : "48MP + 12MP + 12MP",
            pin : "4.422 mAh", sac : "27W", heDieuHanh : "iOS 17", NamG : true
        }
    },
    {
        id: 2,
        ten: "Samsung Galaxy S24 Ultra",
        giaHienTai: "27.490.000đ",
        giaCu: "31.990.000đ",
        anh: "https://tse3.mm.bing.net/th/id/OIP.v2gZ9YqRjr841Ch31Q18GAHaHa?rs=1&pid=ImgDetMain&o=7&rm=3",
        thongSo: {
            Chip : "A17Pro", Ram : "8GB", boNho : "256GB", manHinh : "Super Retina XDR", camera : "48MP + 12MP + 12MP",
            pin : "4.422 mAh", sac : "27W", heDieuHanh : "iOS 17", NamG : true
        }
    }
];


const khoSanPham = document.getElementById("danh-sach-sp");

if (khoSanPham) {
    danhSachDienThoai.forEach(function (item) {
        const htmlCard = `
    <div class="the-san-pham">
    <a href="product-detail.html?id=${item.id}" class="product-link"> 
        <img src="${item.anh}" alt="${item.ten}">
        <h3>${item.ten}</h3>
    </a>

    
    <p class="gia-tien">${item.giaHienTai}</p>
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

    //Hien thi trang chi tiet san pham
    const trangChiTiet = document.querySelector(".wrapper-product-detail")

    if (trangChiTiet){
        const urlParams = new URLSearchParams(window.location.search);
        const idCanTim = parseInt(urlParams.get("id"));

        const sanPham = danhSachDienThoai.find(sp => sp.id === idCanTim);
        if (!sanPham) {
            document.body.innerHTML = "<h2>Không tìm thấy sản phẩm</h2>";
            return;
        }
        if (sanPham){
            document.querySelector('.image-product-detail img').src = sanPham.anh;
            document.querySelector('.inform-product-detail h2').innerText = sanPham.ten;
            document.querySelector('.price-product-detail h2').innerText = sanPham.giaHienTai;
            document.querySelector('.price-product-detail #old-price').innerText = sanPham.giaCu; 
        }
    
        let thongSo = document.querySelector(".thong-so-ky-thuat");
        if (thongSo && sanPham){
            const htmlCard = `
                  <tr><td>Chip</td><td>${sanPham.thongSo["Chip"]}</td></tr>
                    <tr><td>Ram</td><td>${sanPham.thongSo["Ram"]}</td></tr>
                    <tr><td>Bộ nhớ</td><td>${sanPham.thongSo["boNho"]}</td></tr>
                    <tr><td>Màn hình</td><td>${sanPham.thongSo["manHinh"]}</td></tr>
                    <tr><td>Camera</td><td>${sanPham.thongSo["camera"]}</td></tr>
                    <tr><td>Pin</td><td>${sanPham.thongSo["pin"]}</td></tr>
                    <tr><td>Sạc</td><td>${sanPham.thongSo["sac"]}</td></tr>
                    <tr><td>Hệ điều hành</td><td>${sanPham.thongSo["heDieuHanh"]}</td></tr>
                    <tr><td>5G</td><td>${sanPham.thongSo["NamG"] === true ? "Có" : "Không"}</td></tr>
            `
            thongSo.innerHTML = htmlCard;
        }
    }
});


