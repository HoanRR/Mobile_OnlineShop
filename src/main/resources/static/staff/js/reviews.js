/**
 * Staff Reviews Page JavaScript
 * Handles review filtering and reply submission.
 */

let staffReviewProducts = [
  { id: 'SP005', name: 'Samsung Galaxy A06 5G Ch\u00ednh h\u00e3ng', rating: 5.0, total: 73, latest: 'H\u00f4m nay, 19:42' },
  { id: 'SP001', name: 'iPhone 15 Plus 256GB', rating: 4.8, total: 45, latest: 'H\u00f4m qua, 14:30' },
  { id: 'SP002', name: 'Samsung Galaxy S26 Ultra', rating: 4.6, total: 38, latest: '2 ng\u00e0y tr\u01b0\u1edbc, 10:15' },
  { id: 'SP003', name: 'Xiaomi 14 Pro', rating: 2.8, total: 12, latest: '3 ng\u00e0y tr\u01b0\u1edbc, 08:20' }
];

function useStaffReviewsApi() {
  return Boolean(window.HTApi?.isEnabled());
}

function escapeHtml(value) {
  const div = document.createElement('div');
  div.textContent = value;
  return div.innerHTML;
}

function getReviewFilterMode(value) {
  const normalized = normalizeText(value);
  if (normalized.includes('duoi 3')) return 'low';
  if (normalized.includes('4 sao') || normalized.includes('tro len')) return 'high';
  return '';
}

function mapProductReviewSummary(product) {
  const mapped = HTApi.mapProduct(product);
  return {
    id: mapped.product_id || mapped.id,
    name: mapped.name || '-',
    rating: Number(product.avg_rating ?? product.avgRating ?? product.rating ?? 0),
    total: Number(product.total_reviews ?? product.totalReviews ?? product.review_count ?? product.reviewCount ?? 0),
    latest: product.latest_review_date || product.latestReviewDate || '-'
  };
}

async function loadReviewProductsFromApi() {
  if (!useStaffReviewsApi()) return;

  const filterBar = document.querySelector('.filter-bar');
  const searchInput = filterBar ? filterBar.querySelector('input') : null;
  const keyword = searchInput ? searchInput.value.trim() : '';

  try {
    const response = await HTApi.products.list({ page: 1, limit: 100, keyword });
    staffReviewProducts = HTApi.listData(response).map(mapProductReviewSummary);
  } catch (error) {
    console.warn('Khong tai duoc danh sach danh gia tu API:', error);
  }
}

async function refreshReviewProducts() {
  await loadReviewProductsFromApi();
  renderReviewProducts();
}

function getFilteredReviews() {
  const filterBar = document.querySelector('.filter-bar');
  const searchInput = filterBar ? filterBar.querySelector('input') : null;
  const ratingSelect = filterBar ? filterBar.querySelector('select') : null;
  const keyword = normalizeText(searchInput ? searchInput.value : '');
  const mode = getReviewFilterMode(ratingSelect ? ratingSelect.value : '');

  return staffReviewProducts.filter((product) => {
    const matchesKeyword = !keyword
      || normalizeText(product.id).includes(keyword.replace(/^#/, ''))
      || normalizeText(product.name).includes(keyword);
    const matchesRating = !mode
      || (mode === 'low' && product.rating < 3)
      || (mode === 'high' && product.rating >= 4);
    return matchesKeyword && matchesRating;
  });
}

function renderReviewProducts() {
  const tableBody = document.querySelector('.admin-table tbody');
  if (!tableBody) return;

  const products = getFilteredReviews();

  if (!products.length) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="6" style="text-align:center; color:var(--muted); padding:28px;">Kh\u00f4ng t\u00ecm th\u1ea5y \u0111\u00e1nh gi\u00e1 ph\u00f9 h\u1ee3p</td>
      </tr>
    `;
    return;
  }

  tableBody.innerHTML = products.map((product) => `
    <tr>
      <td style="color:var(--muted);">#${product.id}</td>
      <td style="color:var(--text); font-weight:500;">${product.name}</td>
      <td><span style="color:#f59e0b; font-weight:bold;">${product.rating.toFixed(1)} <i class="fa-solid fa-star"></i></span></td>
      <td style="color:var(--text);">${product.total} l\u01b0\u1ee3t</td>
      <td style="color:var(--muted); font-size:13px;">${product.latest}</td>
      <td><a href="review-detail.html?id=${encodeURIComponent(product.id)}" class="btn-edit" style="text-decoration:none; display:inline-block;">Xem chi ti\u1ebft</a></td>
    </tr>
  `).join('');
}

function reviewStars(rating) {
  const count = Math.max(1, Math.min(5, Math.round(Number(rating) || 5)));
  return '\u2b50'.repeat(count);
}

function detailProductId() {
  const raw = new URLSearchParams(window.location.search).get('id');
  if (!raw) return '';
  return String(raw).replace(/^SP/i, '').replace(/\D/g, '') || raw;
}

function renderReviewDetail(product, reviewPayload) {
  const list = document.querySelector('.reviews-list');
  if (!list) return;

  const reviews = reviewPayload?.reviews || HTApi.listData(reviewPayload) || product.reviews || [];
  const title = product.name || product.product_name || '-';
  const rating = Number(reviewPayload?.avg_rating ?? product.avg_rating ?? product.avgRating ?? 0);
  const total = Number(reviewPayload?.total_reviews ?? product.total_reviews ?? product.totalReviews ?? reviews.length);

  const titleEl = document.querySelector('.product-info-panel h2');
  const ratingStarsEl = document.querySelector('.product-rating-stars');
  const ratingCountEl = document.querySelector('.product-rating-count');
  const priceEl = document.querySelector('.product-price');
  const stockEl = document.querySelector('.product-stock');

  if (titleEl) titleEl.textContent = title;
  if (ratingStarsEl) ratingStarsEl.textContent = reviewStars(rating);
  if (ratingCountEl) ratingCountEl.textContent = `(${total} \u0111\u00e1nh gi\u00e1)`;
  if (priceEl) priceEl.textContent = new Intl.NumberFormat('vi-VN').format(Number(product.price || 0)) + '\u20ab';
  if (stockEl) stockEl.textContent = `T\u1ed3n kho: ${Number(product.stock || 0)} m\u00e1y`;

  if (!reviews.length) {
    list.innerHTML = `<div style="color:var(--muted); padding:24px;">Ch\u01b0a c\u00f3 \u0111\u00e1nh gi\u00e1 cho s\u1ea3n ph\u1ea9m n\u00e0y.</div>`;
    return;
  }

  list.innerHTML = reviews.map((review) => `
    <div class="review-item">
      <div class="review-item-header">
        <div class="review-item-user">
          <div class="review-item-name">${escapeHtml(review.username || review.user_name || review.userName || 'Kh\u00e1ch h\u00e0ng')}</div>
          <div class="review-item-phone">${escapeHtml(review.phone_number || review.phoneNumber || '')}</div>
        </div>
        <span class="review-item-rating">${reviewStars(review.rating)}</span>
      </div>
      <div class="review-item-content">${escapeHtml(review.comment || '')}</div>
      <div class="review-item-time">${escapeHtml(review.review_date || review.reviewDate || '')}</div>
      <div class="reply-section">
        <div class="reply-box">
          <textarea placeholder="Nh\u1eadp c\u00e2u tr\u1ea3 l\u1eddi cho kh\u00e1ch h\u00e0ng..."></textarea>
          <button class="btn-submit-reply" onclick="submitReply(this)">G\u1eedi ph\u1ea3n h\u1ed3i</button>
        </div>
      </div>
    </div>
  `).join('');
}

async function loadReviewDetailFromApi() {
  if (!useStaffReviewsApi() || !document.querySelector('.reviews-list')) return;

  const productId = detailProductId();
  if (!productId) return;

  try {
    const product = HTApi.mapProduct(await HTApi.products.detail(productId));
    let reviewPayload = { reviews: product.reviews || [] };
    try {
      reviewPayload = await HTApi.products.reviews(productId, { page: 1, limit: 50 });
    } catch (error) {
      console.warn('Khong tai duoc reviews rieng, dung reviews trong product detail:', error);
    }
    renderReviewDetail(product, reviewPayload);
  } catch (error) {
    console.warn('Khong tai duoc chi tiet danh gia tu API:', error);
  }
}

function initReviewFilterEvents() {
  const filterBar = document.querySelector('.filter-bar');
  const filterButton = filterBar ? filterBar.querySelector('button') : null;
  const fields = filterBar ? filterBar.querySelectorAll('input, select') : [];

  if (filterButton) filterButton.addEventListener('click', refreshReviewProducts);

  fields.forEach((field) => {
    field.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') refreshReviewProducts();
    });
  });
}

function submitReply(button) {
  const textarea = button.previousElementSibling;

  if (!textarea || !textarea.value.trim()) {
    if (textarea) textarea.focus();
    return;
  }

  const replyText = textarea.value.trim();
  const replySection = button.closest('.reply-section');
  const reviewItem = button.closest('.review-item');

  if (!reviewItem) return;

  const replyHTML = `
    <div class="replied-content">
      <div class="replied-content-header">HT Mobile (Nh\u00e2n Vi\u00ean) - V\u1eeba xong</div>
      <p class="replied-content-text">${escapeHtml(replyText)}</p>
    </div>
  `;

  const reviewTime = reviewItem.querySelector('.review-item-time');
  const existingReplies = reviewItem.querySelectorAll('.replied-content');

  if (existingReplies.length) {
    existingReplies[existingReplies.length - 1].insertAdjacentHTML('afterend', replyHTML);
  } else if (reviewTime) {
    reviewTime.insertAdjacentHTML('afterend', replyHTML);
  }

  textarea.value = '';
  if (replySection) replySection.style.display = 'none';
}

document.addEventListener('DOMContentLoaded', async () => {
  initCommonUI();
  displayCurrentDate();
  highlightActivePage();
  setupLogout();
  initReviewFilterEvents();
  await loadReviewProductsFromApi();
  renderReviewProducts();
  await loadReviewDetailFromApi();
});
