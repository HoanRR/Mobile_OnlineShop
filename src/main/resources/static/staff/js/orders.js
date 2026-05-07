/**
 * Orders Page JavaScript
 * Handles orders list, status modal, and order management
 */

// ========== MODAL FUNCTIONS ==========
function openModal(orderId) {
  const modalOrderId = document.getElementById('modalOrderId');
  const statusModal = document.getElementById('statusModal');
  
  if (!modalOrderId || !statusModal) {
    console.warn('Modal elements not found');
    return;
  }
  
  modalOrderId.innerText = '#' + orderId;
  statusModal.style.display = 'flex';
}

function closeModal() {
  const statusModal = document.getElementById('statusModal');
  if (!statusModal) {
    console.warn('Modal element not found');
    return;
  }
  
  statusModal.style.display = 'none';
}

function saveStatus() {
  const modalOrderId = document.getElementById('modalOrderId');
  if (!modalOrderId) {
    console.warn('Modal order ID element not found');
    return;
  }
  
  alert('Đã cập nhật trạng thái thành công cho đơn ' + modalOrderId.innerText);
  closeModal();
}

// ========== PAGE INITIALIZATION ==========
document.addEventListener('DOMContentLoaded', () => {
  initCommonUI();
  displayCurrentDate();
  highlightActivePage();
  setupLogout();
  console.log('Orders page loaded successfully');
});
