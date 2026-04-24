// Products page script
const mockProducts = [
    { id: 1, name: "iPhone 15 Pro Max", brand: "Apple", series: "iPhone 15", price: 29990000, thumbnail: "url_img_1", avg_rating: 4.8 },
    { id: 2, name: "Samsung Galaxy S24 Ultra", brand: "Samsung", series: "Galaxy S", price: 33990000, thumbnail: "url_img_2", avg_rating: 4.7 }
];

document.addEventListener("DOMContentLoaded", () => {
    const tableBody = document.querySelector('.admin-table tbody');
    if (!tableBody) return;

    tableBody.innerHTML = "";
    mockProducts.forEach(prod => {
        const row = `
            <tr>
                <td>#${prod.id}</td>
                <td><strong>${prod.name}</strong></td>
                <td>${prod.brand}</td>
                <td style="color: #FF3D00; font-weight: bold;">${formatCurrency(prod.price)}</td>
                <td>
                    <div class="action-btns">
                        <button class="btn-edit">Sửa</button>
                        <button class="btn-delete">Xóa</button>
                    </div>
                </td>
            </tr>
        `;
        tableBody.insertAdjacentHTML('beforeend', row);
    });
});
