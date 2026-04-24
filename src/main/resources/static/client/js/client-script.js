document.addEventListener("DOMContentLoaded", () => {
    // In a Spring Boot app, you'd typically use Thymeleaf layout fragments for Header/Footer styling
    // But since you asked for fetch technique:
    fetch('header.html')
        .then(response => response.text())
        .then(data => {
            const headerPlaceholder = document.getElementById('header-placeholder');
            if (headerPlaceholder) {
                headerPlaceholder.innerHTML = data;
            }
        }).catch(err => console.log('Error loading header:', err));

    fetch('footer.html')
        .then(response => response.text())
        .then(data => {
            const footerPlaceholder = document.getElementById('footer-placeholder');
            if (footerPlaceholder) {
                footerPlaceholder.innerHTML = data;
            }
        }).catch(err => console.log('Error loading footer:', err));
});