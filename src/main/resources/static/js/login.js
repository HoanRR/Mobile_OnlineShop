const danhSachUser = [
    { username: "admin", password: "admin" },
    { username: "khachhang1", password: "123" }
];

function xuLyDangKy(){

}

function xuLyDangNhap(){
    const user = document.getElementById("username").value;
    const password = document.getElementById("password").value;
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
nutDangNhap.addEventListener("click", xuLyDangNhap);

const nutPassWord = document.getElementById("password");
nutPassWord.addEventListener("keypress" , function(event){
    if (event.key == "Enter"){
        nutDangNhap.click();
    }
})