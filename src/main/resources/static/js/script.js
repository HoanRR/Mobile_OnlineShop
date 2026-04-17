

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
        },
        moTa: "Xiaomi Redmi Note 15 5G là sản phẩm điện thoại thuộc phân khúc tầm trung của Xiaomi, tập trung vào cấu hình cân bằng và công nghệ hiển thị hiện đại. Thiết bị sở hữu màn hình AMOLED 6.77 inch độ phân giải Full HD+ với tần số quét 120Hz, mang lại độ mượt cao. Bên trong là vi xử lý Snapdragon 6 Gen 3, RAM 6GB và bộ nhớ trong 128GB đáp ứng tốt nhu cầu đa nhiệm. Cụm camera chính 108MP kết hợp pin dung lượng khoảng 5520mAh hỗ trợ sạc nhanh 45W, tối ưu cho sử dụng dài ngày."
        
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
        },
        moTa: "Xiaomi Redmi Note 15 5G là sản phẩm điện thoại thuộc phân khúc tầm trung của Xiaomi, tập trung vào cấu hình cân bằng và công nghệ hiển thị hiện đại. Thiết bị sở hữu màn hình AMOLED 6.77 inch độ phân giải Full HD+ với tần số quét 120Hz, mang lại độ mượt cao. Bên trong là vi xử lý Snapdragon 6 Gen 3, RAM 6GB và bộ nhớ trong 128GB đáp ứng tốt nhu cầu đa nhiệm. Cụm camera chính 108MP kết hợp pin dung lượng khoảng 5520mAh hỗ trợ sạc nhanh 45W, tối ưu cho sử dụng dài ngày."
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

    <div class="gia-tien">
    <p class="gia-hien-tai">${item.giaHienTai}</p><p class="gia-cu">${item.giaCu}</p>
    </div>
        <div class="nhom-nut-mua">
            <button class="nut-them-vao-gio">Thêm vào giỏ</button>
            <button class="nut-mua">Mua hàng</button>
            </zdiv>
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

        let danhGiaChiTiet = document.querySelector(".noi-dung-mo-ta");
        if (danhGiaChiTiet && sanPham){
            const htmlCard = `
                <p>${sanPham.moTa}</p>
            `
            danhGiaChiTiet.innerHTML = htmlCard;
        }
    }
});


// ========================= Dang nhap ===============================//

const danhSachUser = [
    { username: "admin", password: "admin" },
    { username: "khachhang1", password: "123" }
];

function xuLyDangKy(){

}

function xuLyDangNhap(){
    const user = document.getElementById("username");
    const password = document.getElementById("password");
    if (!user || !password){
        alert("Vui lòng nhập đầy đủ đủ thông tin");
        return;
    }

    

    const userHopLe = danhSachUser.find(u => u.username == user && u.password == password);
    
    if (userHopLe){
        alert("Đăng nhập thành công!");
        localStorage.setItem("currentUser", JSON.stringify(userHopLe));
        window.location.href = "index.html";
    }   else {
        alert("Sai tên đăng nhập hoặc mật khẩu!");
    }
}

const nutDangNhap = document.getElementById("button-dang-nhap");
if (nutDangNhap){
    nutDangNhap.addEventListener("click", xuLyDangNhap);
}