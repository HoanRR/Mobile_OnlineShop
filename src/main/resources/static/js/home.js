
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
            </div>
    </div>
    `

        khoSanPham.insertAdjacentHTML("beforeend", htmlCard);
    });
}
else{
    alert("khong tim thay san pham");   
}


