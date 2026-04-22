

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