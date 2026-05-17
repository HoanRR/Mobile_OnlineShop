/**
 * Admin Reviews Page JavaScript
 * Handles review filtering, reply submission, and product visibility actions.
 */

let adminReviewProducts = [
  { id: 'SP005', name: 'Samsung Galaxy A06 5G Ch\u00ednh h\u00e3ng', rating: 5.0, total: 73, latest: 'H\u00f4m nay, 19:42' },
  { id: 'SP001', name: 'iPhone 15 Plus 256GB', rating: 4.8, total: 45, latest: 'H\u00f4m qua, 14:30' },
  { id: 'SP002', name: 'Samsung Galaxy S26 Ultra', rating: 4.6, total: 38, latest: '2 ng\u00e0y tr\u01b0\u1edbc, 10:15' },
  { id: 'SP003', name: 'Xiaomi 14 Pro', rating: 2.8, total: 12, latest: '3 ng\u00e0y tr\u01b0\u1edbc, 08:20' }
];

function useAdminReviewsApi() {
  return Boolean(window.HTApi?.isEnabled());
}

function escapeHtml(value) {
  const div = document.createElement('div');
  div.textContent = value;
  return div.innerHTML;
}

function reviewFilterMode(value) {
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

async function loadAdminReviewProductsFromApi() {
  if (!useAdminReviewsApi()) return;

  const filterBar = document.querySelector('.filter-bar');
  const searchInput = filterBar ? filterBar.querySelector('input') : null;
  const keyword = searchInput ? searchInput.value.trim() : '';

  try {
    const response = await HTApi.products.list({ page: 1, limit: 100, keyword });
    adminReviewProducts = HTApi.listData(response).map(mapProductReviewSummary);
  } catch (error) {
    console.warn('Khong tai duoc danh sach danh gia tu API:', error);
  }
}

async function refreshAdminReviewProducts() {
  await loadAdminReviewProductsFromApi();
  renderAdminReviewProducts();
}

function getFilteredAdminReviews() {
  const filterBar = document.querySelector('.filter-bar');
  const searchInput = filterBar ? filterBar.querySelector('input') : null;
  const ratingSelect = filterBar ? filterBar.querySelector('select') : null;
  const keyword = normalizeText(searchInput ? searchInput.value : '');
  const mode = reviewFilterMode(ratingSelect ? ratingSelect.value : '');

  return adminReviewProducts.filter((product) => {
    const matchesKeyword = !keyword
      || normalizeText(product.id).includes(keyword.replace(/^#/, ''))
      || normalizeText(product.name).includes(keyword);
    const matchesRating = !mode
      || (mode === 'low' && product.rating < 3)
      || (mode === 'high' && product.rating >= 4);
    return matchesKeyword && matchesRating;
  });
}

function renderAdminReviewProducts() {
  const tableBody = document.querySelector('.admin-table tbody');
  if (!tableBody) return;

  const products = getFilteredAdminReviews();

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
      <td><a href="admin-review-detail.html?id=${encodeURIComponent(product.id)}" class="btn-edit" style="text-decoration:none; display:inline-block;">Xem chi ti\u1ebft</a></td>
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

function renderAdminReviewDetail(product, reviewPayload) {
  const list = document.querySelector('.danh-sach-binh-luan-mc');
  if (!list) return;

  const reviews = reviewPayload?.reviews || HTApi.listData(reviewPayload) || product.reviews || [];
  const image = product.product_image_link || product.productImageLink || product.image;
  const title = product.name || product.product_name || '-';
  const rating = Number(reviewPayload?.avg_rating ?? product.avg_rating ?? product.avgRating ?? 0);
  const total = Number(reviewPayload?.total_reviews ?? product.total_reviews ?? product.totalReviews ?? reviews.length);

  const heading = document.querySelector('.inform-product-detail h2');
  const header = document.querySelector('.header-danh-gia h2');
  const imageEl = document.querySelector('.image-product-detail img');
  const brandEl = document.getElementById('label-detail');
  const ratingEl = document.getElementById('rating');
  const stockEl = document.getElementById('available');
  const priceEl = document.querySelector('.price-product-detail h2');

  if (heading) heading.textContent = title;
  if (header) header.textContent = `Qu\u1ea3n l\u00fd H\u1ecfi \u0111\u00e1p & \u0110\u00e1nh gi\u00e1 (${title})`;
  if (imageEl && image) imageEl.src = image;
  if (brandEl) brandEl.textContent = product.brand || '';
  if (ratingEl) ratingEl.textContent = `${reviewStars(rating)} (${total} \u0111\u00e1nh gi\u00e1)`;
  if (stockEl) stockEl.textContent = ` T\u1ed3n kho: ${Number(product.stock || 0)} m\u00e1y`;
  if (priceEl) priceEl.textContent = new Intl.NumberFormat('vi-VN').format(Number(product.price || 0)) + '\u20ab';

  if (!reviews.length) {
    list.innerHTML = `<div style="color:var(--muted); padding:24px;">Ch\u01b0a c\u00f3 \u0111\u00e1nh gi\u00e1 cho s\u1ea3n ph\u1ea9m n\u00e0y.</div>`;
    return;
  }

  list.innerHTML = reviews.map((review) => `
    <div class="item-binh-luan-mc">
      <div class="noi-dung-chinh">
        <div class="header-user">
          <span class="ten">${escapeHtml(review.username || review.user_name || review.userName || 'Kh\u00e1ch h\u00e0ng')}</span>
          <span class="sao-danh-gia">${reviewStars(review.rating)}</span>
        </div>
        <div class="text-binh-luan">${escapeHtml(review.comment || '')}</div>
        <div class="action-binh-luan">
          <span class="thoi-gian">${escapeHtml(review.review_date || review.reviewDate || '')}</span>
        </div>
        <div class="staff-reply-section" style="margin-top: 12px; padding-top: 12px; border-top: 1px dashed #475569;">
          <div class="staff-reply-box" style="display: flex; flex-direction: column; gap: 8px;">
            <textarea placeholder="Nh\u1eadp ph\u1ea3n h\u1ed3i..." style="width: 100%; padding: 8px; border: 1px solid #475569; background: #0f1117; color: #e2e8f8; border-radius: 4px; resize: vertical; min-height: 60px; font-family: inherit;"></textarea>
            <button class="btn-submit-reply" onclick="submitReply(this)" style="align-self: flex-end; padding: 6px 12px; background: #22c55e; color: white; border: none; border-radius: 4px; cursor: pointer;">G\u1eedi ph\u1ea3n h\u1ed3i</button>
          </div>
        </div>
      </div>
    </div>
  `).join('');
}

async function loadAdminReviewDetailFromApi() {
  if (!useAdminReviewsApi() || !document.querySelector('.danh-sach-binh-luan-mc')) return;

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
    renderAdminReviewDetail(product, reviewPayload);
  } catch (error) {
    console.warn('Khong tai duoc chi tiet danh gia tu API:', error);
  }
}

function initReviewFilterEvents() {
  const filterBar = document.querySelector('.filter-bar');
  const filterButton = filterBar ? filterBar.querySelector('button') : null;
  const fields = filterBar ? filterBar.querySelectorAll('input, select') : [];

  if (filterButton) filterButton.addEventListener('click', refreshAdminReviewProducts);

  fields.forEach((field) => {
    field.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') refreshAdminReviewProducts();
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
  const staffReplySection = button.closest('.staff-reply-section');
  const contentWrapper = button.closest('.noi-dung-chinh');

  if (!contentWrapper) return;

  contentWrapper.insertAdjacentHTML('beforeend', `
    <div class="replied-content">
      <strong>HT Mobile (Admin) - V\u1eeba xong</strong>
      <p>${escapeHtml(replyText)}</p>
    </div>
  `);

  textarea.value = '';
  if (staffReplySection) staffReplySection.style.display = 'none';
}

function editProduct() {
  window.location.href = 'products.html?q=Samsung%20Galaxy%20A06';
}

function hideProduct() {
  const button = document.querySelector('.btn-hide');
  if (!button) return;

  const hidden = button.dataset.hidden === '1';
  showAdminConfirm({
    title: hidden ? 'Hiển thị lại sản phẩm?' : 'Ẩn sản phẩm?',
    message: hidden ? 'Bạn có muốn hiển thị lại sản phẩm không?' : 'Bạn có muốn ẩn sản phẩm không?',
    confirmText: hidden ? 'Hiển thị lại' : 'Ẩn',
    cancelText: 'Hủy',
    tone: 'warning',
    icon: hidden ? 'fa-eye' : 'fa-eye-slash'
  }).then((confirmed) => {
    if (!confirmed) return;

    button.dataset.hidden = hidden ? '0' : '1';
    button.textContent = hidden ? 'Tạm ẩn sản phẩm' : 'Hiển thị lại sản phẩm';
  });
}

document.addEventListener('DOMContentLoaded', async () => {
  initCommonUI();
  initReviewFilterEvents();
  await loadAdminReviewProductsFromApi();
  renderAdminReviewProducts();
  await loadAdminReviewDetailFromApi();
});
