// Tóm lấy 2 phần tử cần thiết
const nutTacKe = document.getElementById("nut-tac-ke-hoa");
const dongChu = document.getElementById("trang-thai");

// Sự kiện 1: Khi LƯỚT CHUỘT VÀO
nutTacKe.addEventListener("mouseenter", function() {
    nutTacKe.style.backgroundColor = "orange";
});

// Sự kiện 2: Khi RỜI CHUỘT RA
nutTacKe.addEventListener("mouseleave", function() {
    nutTacKe.style.backgroundColor = "blue"; // Trả lại màu gốc
});

// Sự kiện 3: Khi CLICK CHUỘT
nutTacKe.addEventListener("click", function() {
    // Đổi chữ của thẻ h2 ở trên
    dongChu.innerText = "Wow! Bạn vừa bấm trúng con tắc kè!";
    
    // Đổi luôn chữ của chính cái nút
    nutTacKe.innerText = "Đã bị bắt!";
});
