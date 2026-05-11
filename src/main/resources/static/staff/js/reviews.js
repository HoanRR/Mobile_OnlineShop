/**
 * Staff Reviews Page JavaScript
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

  const replyText = textarea.value.trim();
  const replyBox = button.closest('.reply-box');
  const replySection = button.closest('.reply-section');
  const reviewItem = button.closest('.review-item');

  if (!reviewItem) {
    console.warn('Review item not found');
    return;
  }

  // Create replied content HTML using CSS classes
  const replyHTML = `
    <div class="replied-content">
      <div class="replied-content-header">HT Mobile (Nhân Viên) - Vừa xong</div>
      <p class="replied-content-text">${replyText}</p>
    </div>
  `;

  // Find insertion point (after the review time or after last replied content)
  const reviewItemTime = reviewItem.querySelector('.review-item-time');
  const existingReplies = reviewItem.querySelectorAll('.replied-content');
  
  if (existingReplies.length > 0) {
    // Insert after last reply
    existingReplies[existingReplies.length - 1].insertAdjacentHTML('afterend', replyHTML);
  } else {
    // Insert after time
    if (reviewItemTime) {
      reviewItemTime.insertAdjacentHTML('afterend', replyHTML);
    }
  }

  // Hide reply section
  if (replySection) {
    replySection.style.display = 'none';
  }

  alert('Đã gửi phản hồi thành công!');
  console.log('Reply submitted successfully:', replyText);
}

// ========== PAGE INITIALIZATION ==========
document.addEventListener('DOMContentLoaded', () => {
  // Initialize common UI (sidebar toggle, date, logout)
  initCommonUI();
  displayCurrentDate();
  highlightActivePage();
  setupLogout();

  console.log('Staff reviews page loaded successfully');
});
