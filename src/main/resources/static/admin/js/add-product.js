/**
 * Add Product page script
 * Saves products to localStorage while backend APIs are not connected.
 */

const PRODUCTS_STORAGE_KEY = 'ht_products';

const addProductDefaultProducts = [
  { id: 'SP001', name: 'iPhone 15 Pro Max 256GB', brand: 'Apple', price: 29990000, stock: 12 },
  { id: 'SP002', name: 'Samsung Galaxy S24 Ultra', brand: 'Samsung', price: 27990000, stock: 8 },
  { id: 'SP003', name: 'Xiaomi 14 Pro', brand: 'Xiaomi', price: 22500000, stock: 0 }
];

function useAddProductApi() {
  return Boolean(window.HTApi?.isEnabled());
}

async function showAddProductWarning(message) {
  if (typeof showAdminWarning === 'function') {
    await showAdminWarning({ message, confirmText: 'OK' });
  }
}

async function showAddProductError(message) {
  if (typeof showAdminError === 'function') {
    await showAdminError({ message, confirmText: 'OK' });
  }
}

async function showAddProductSuccess(message) {
  if (typeof showAdminNotice === 'function') {
    await showAdminNotice({
      title: 'Lưu sản phẩm thành công',
      message,
      confirmText: 'OK'
    });
  }
}

function readProducts() {
  return HTAdminCatalog.readProducts(addProductDefaultProducts);
}

function saveProducts(products) {
  HTAdminCatalog.writeProducts(products);
}

function createInputCell(placeholder, type = 'text', field = '') {
  return `<input type="${type}" data-field="${field}" placeholder="${placeholder}" style="width:100%; padding:10px; background:var(--bg); border:1px solid var(--border); color:var(--text); border-radius:6px;">`;
}

function addVariantRow() {
  const tableBody = document.querySelector('#variantTable tbody');
  if (!tableBody) return;

  const row = document.createElement('tr');
  row.innerHTML = `
    <td>${createInputCell('8GB', 'text', 'ram')}</td>
    <td>${createInputCell('256GB', 'text', 'storage_capacity')}</td>
    <td>${createInputCell('Titan', 'text', 'color')}</td>
    <td>${createInputCell('29990000', 'number', 'price')}</td>
    <td>${createInputCell('12', 'number', 'total_available')}</td>
    <td>${createInputCell('https://...', 'url', 'variant_image_link')}</td>
    <td style="text-align:center;"><button type="button" class="btn-delete" data-action="remove-variant"><i class="fa-solid fa-trash"></i></button></td>
  `;
  tableBody.appendChild(row);
}

function getNextProductId(products) {
  const maxNumber = products.reduce((max, product) => {
    const value = Number(String(product.id || '').replace(/\D/g, ''));
    return Number.isNaN(value) ? max : Math.max(max, value);
  }, 0);

  return `SP${String(maxNumber + 1).padStart(3, '0')}`;
}

function collectVariants() {
  const chip = document.getElementById('productChip')?.value.trim() || '';
  const batteryCapacity = document.getElementById('batteryCapacity')?.value.trim() || '';
  const resolution = document.getElementById('resolution')?.value.trim() || '';
  const productImageLink = document.getElementById('productImageLink')?.value.trim() || '';

  return Array.from(document.querySelectorAll('#variantTable tbody tr'))
    .map((row) => {
      const getField = (field) => row.querySelector(`[data-field="${field}"]`)?.value.trim() || '';
      const storageText = getField('storage_capacity');
      return {
        ram: getField('ram'),
        storage: storageText,
        storage_capacity: Number(String(storageText).replace(/\D/g, '')) || 0,
        color: getField('color'),
        price: Number(getField('price')),
        total_available: Number(getField('total_available')) || 0,
        variant_image_link: getField('variant_image_link') || productImageLink,
        battery_capacity: batteryCapacity,
        resolution,
        chip
      };
    })
    .filter((variant) => variant.ram || variant.storage_capacity || variant.storage || variant.color || variant.price);
}

function handleImagePreview() {
  const input = document.getElementById('file-upload');
  const uploadBox = input ? input.closest('div') : null;
  if (!input || !uploadBox) return;

  input.addEventListener('change', () => {
    const file = input.files && input.files[0];
    const label = uploadBox.querySelector('p');
    if (label) {
      label.textContent = file ? file.name : 'B\u1ea5m ch\u1ecdn \u1ea3nh';
    }
  });
}

async function handleProductSubmit(event) {
  event.preventDefault();

  const form = event.currentTarget;
  const productName = document.getElementById('productName');
  const brandSelect = document.getElementById('productBrand');
  const productImageLink = document.getElementById('productImageLink')?.value.trim() || '';
  const name = productName ? productName.value.trim() : '';
  const brand = brandSelect ? brandSelect.value.trim() : '';
  const variants = collectVariants();

  if (!name || !brand) {
    await showAddProductWarning('Vui lòng nhập tên sản phẩm và chọn hãng.');
    return;
  }

  if (!variants.length) {
    await showAddProductWarning('Vui lòng thêm ít nhất một phiên bản cấu hình.');
    return;
  }

  const invalidVariant = variants.some((variant) => Number.isNaN(variant.price) || variant.price <= 0 || variant.total_available < 0);
  if (invalidVariant) {
    await showAddProductWarning('Giá bán phải lớn hơn 0 và tồn kho không được âm.');
    return;
  }

  const products = readProducts();
  const firstVariant = variants[0];

  const apiPayload = {
    product_name: name,
    brand,
    product_image_link: productImageLink,
    variants
  };

  let apiProduct = null;
  if (useAddProductApi()) {
    try {
      apiProduct = HTApi.mapProduct(await HTApi.admin.products.create(apiPayload));
    } catch (error) {
      await showAddProductError(error.message || 'Không lưu được sản phẩm qua API.');
      return;
    }
  }

  const newProductId = apiProduct?.id || getNextProductId(products);
  const savedVariants = apiProduct?.variants?.length ? apiProduct.variants : variants;
  const newProduct = HTAdminCatalog.normalizeProducts([{
    id: newProductId,
    product_id: apiProduct?.product_id,
    product_name: name,
    name: `${name}${firstVariant.storage ? ` ${firstVariant.storage}` : ''}`.trim(),
    brand,
    product_image_link: productImageLink,
    price: apiProduct?.price || firstVariant.price,
    stock: savedVariants.reduce((sum, variant) => sum + Number(variant.total_available || variant.totalAvailable || 0), 0),
    variants: savedVariants
  }])[0];

  products.unshift(newProduct);

  saveProducts(products);
  await showAddProductSuccess(useAddProductApi() ? 'Đã gửi sản phẩm lên API và lưu bản dùng thử.' : 'Đã lưu sản phẩm vào dữ liệu dùng thử.');
  form.reset();

  const tableBody = document.querySelector('#variantTable tbody');
  if (tableBody) {
    tableBody.innerHTML = '';
    addVariantRow();
  }

  const uploadLabel = document.querySelector('#file-upload')?.closest('div')?.querySelector('p');
  if (uploadLabel) uploadLabel.textContent = 'B\u1ea5m ch\u1ecdn \u1ea3nh';
}

function initVariantTableEvents() {
  const table = document.getElementById('variantTable');
  if (!table) return;

  table.addEventListener('click', (event) => {
    const button = event.target.closest('button[data-action="remove-variant"], .btn-delete');
    if (!button) return;

    const rows = table.querySelectorAll('tbody tr');
    if (rows.length <= 1) {
      const inputs = button.closest('tr').querySelectorAll('input');
      inputs.forEach((input) => {
        input.value = '';
      });
      return;
    }

    button.closest('tr').remove();
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initCommonUI();
  initVariantTableEvents();
  handleImagePreview();

  const form = document.querySelector('form');
  if (form) form.addEventListener('submit', handleProductSubmit);
});
