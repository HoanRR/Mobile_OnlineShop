// Add Product page script
document.addEventListener("DOMContentLoaded", () => {
    const form = document.querySelector('form');
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            alert('Sản phẩm đã được thêm thành công!');
            form.reset();
        });
    }
});
