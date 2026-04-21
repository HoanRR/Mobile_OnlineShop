function renderCart() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const container = document.getElementById('cart-items-list');
    
    if (cart.length === 0) {
        container.innerHTML = `<p class="thong-bao-trong">Giỏ hàng của bạn đang trống.</p>
                            <p class="thong-bao-trong">Hãy chọn thêm sản phảm để mua sắm nhé</p>`;
        document.querySelector('.cart-header').style.display = 'none'; 
        return;
    }

    document.querySelector('.cart-header').style.display = 'flex';
    let html = '';
    let allSelected = true;
    cart.forEach((item, index) => {

        if (item.selected === undefined){
            item.selected = true;
        }

        if (!item.selected){
            allSelected = false;
        }
       

        html += `
            <div class="cart-item">
                <input type="checkbox" class="item-checkbox" ${item.selected ? 'checked' : ''} onchange="toggleItemSelection(${index})>
                <img src="${item.anh}" alt="${item.ten}">
                <div class="item-info">
                    <h3>${item.ten}</h3>
                    <p class="item-price">${item.giaHienTai}</p>
                    <button class="btn-remove" onclick="removeItem(${index})">Xóa khỏi giỏ</button>
                </div>
                <div class="item-quantity">
                    <button onclick="updateQty(${index}, -1)">-</button>
                    <span>${item.quantity || 1}</span>
                    <button onclick="updateQty(${index}, 1)">+</button>
                </div>
            </div>
        `;
    });
    container.innerHTML = html;

    document.getElementById('select-all').checked = allSelected;
    localStorage.setItem('cart', JSON.stringify(cart));

    calculateTotal(cart);
}

function updateQty(index, change) {
    let cart = JSON.parse(localStorage.getItem('cart'));
    cart[index].quantity = (cart[index].quantity || 1) + change;
    
    if (cart[index].quantity < 1) cart[index].quantity = 1;
    
    localStorage.setItem('cart', JSON.stringify(cart));
    renderCart();
}

// array.splice(start, deleteCount)
function removeItem(index) {
    let cart = JSON.parse(localStorage.getItem('cart'));
    cart.splice(index, 1);
    localStorage.setItem('cart', JSON.stringify(cart));
    renderCart();
}

function toggleItemSelection(index) {
    let cart = JSON.parse(localStorage.getItem('cart'));
    cart[index].selected = !cart[index].selected; // Đảo ngược trạng thái
    localStorage.setItem('cart', JSON.stringify(cart));
    renderCart();
}

function toggleSelectAll() {
    const isChecked = document.getElementById('select-all').checked;
    let cart = JSON.parse(localStorage.getItem('cart'));
    
    cart.forEach(item => {
        item.selected = isChecked;
    });
    
    localStorage.setItem('cart', JSON.stringify(cart));
    renderCart();
}


function calculateTotal(cart) {
    let total = 0;
    
    cart.forEach(item => {
        if (item.selected) {
            const priceNum = parseInt(item.giaHienTai.replace(/\D/g, ''));
            total += priceNum * (item.quantity || 1);
        }
    });
    
    const formattedTotal = total.toLocaleString('vi-VN') + "đ";
    document.getElementById('temp-total').innerText = formattedTotal;
    document.getElementById('final-total').innerText = formattedTotal;
}

document.addEventListener('DOMContentLoaded', renderCart);