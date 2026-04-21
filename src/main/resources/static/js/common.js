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
})