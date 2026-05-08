/**
 * Admin Reviews Page JavaScript
 * Handles staff reply submission and review management
 */

// ========== SUBMIT REPLY FUNCTION ==========
function submitReply(button) {
  const textarea = button.previousElementSibling;
  
  if (!textarea) {
    console.warn('Textarea not found');
    return;
  }

  if (textarea.value.trim() === '') {
    alert('Vui lòng nhập nội dung phản hồi!');
    return;
  }

  // TODO: Gọi API thực tế khi backend ready
  // fetch('/api/staff/reviews/:id/reply', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('jwt_token')}` },
  //   body: JSON.stringify({ reply: textarea.value })
  // })
  // .then(res => res.json())
  // .then(data => {
  //   alert('Đã gửi phản hồi thành công!');
  //   textarea.value = '';
  //   // Render replied content
  // })
  // .catch(err => alert('Gửi phản hồi thất bại: ' + err.message));

  alert('Đã gửi phản hồi lên hệ thống: ' + textarea.value);
  textarea.value = '';
  console.log('Reply submitted successfully');
}

// ========== EDIT PRODUCT HANDLER ==========
function editProduct() {
  alert('Chuyển hướng tới trang chỉnh sửa sản phẩm...');
  // TODO: window.location.href = '/admin/products/edit/1';
}

// ========== HIDE PRODUCT HANDLER ==========
function hideProduct() {
  if (confirm('Bạn có chắc chắn muốn tạm ẩn sản phẩm này không?')) {
    alert('Đã tạm ẩn sản phẩm khỏi cửa hàng');
    // TODO: fetch('/api/admin/products/:id/hide', { method: 'PUT' })
  }
}

// ========== PAGE INITIALIZATION ==========
document.addEventListener('DOMContentLoaded', () => {
  const editBtn = document.querySelector('.btn-edit');
  const hideBtn = document.querySelector('.btn-hide');

  if (editBtn) {
    editBtn.addEventListener('click', editProduct);
  }

  if (hideBtn) {
    hideBtn.addEventListener('click', hideProduct);
  }

  console.log('Admin reviews page loaded successfully');
});
