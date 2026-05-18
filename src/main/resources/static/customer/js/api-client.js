/**
 * HT Mobile API client.
 *
 * Default mode keeps the current localStorage mock screens working.
 * Enable real API calls with:
 *   localStorage.setItem('ht_use_api', '1')
 *
 * Optional base URL:
 *   localStorage.setItem('ht_api_base_url', 'http://localhost:8080')
 */
(function initHTApi(global) {
  const API_ENABLED_KEY = 'ht_use_api';
  const API_BASE_URL_KEY = 'ht_api_base_url';
  const TOKEN_KEYS = ['jwt_token', 'access_token', 'token'];

  function applyUrlConfig() {
    if (!global.location) return;

    const params = new URLSearchParams(global.location.search);
    if (params.has('api')) {
      const value = String(params.get('api') || '').toLowerCase();
      localStorage.setItem(API_ENABLED_KEY, ['1', 'true', 'yes', 'on'].includes(value) ? '1' : '0');
    }

    if (params.has('apiBaseUrl')) {
      localStorage.setItem(API_BASE_URL_KEY, params.get('apiBaseUrl') || '');
    }
  }

  applyUrlConfig();

  function isEnabled() {
    return localStorage.getItem(API_ENABLED_KEY) === '1';
  }

  function setEnabled(enabled) {
    localStorage.setItem(API_ENABLED_KEY, enabled ? '1' : '0');
  }

  function getBaseUrl() {
    const metaBaseUrl = document.querySelector('meta[name="ht-api-base-url"]')?.content || '';
    const globalBaseUrl = global.HT_API_BASE_URL || '';
    return (localStorage.getItem(API_BASE_URL_KEY) || globalBaseUrl || metaBaseUrl || '').replace(/\/$/, '');
  }

  function getToken() {
    return TOKEN_KEYS.map((key) => localStorage.getItem(key)).find(Boolean) || '';
  }

  function setToken(token) {
    if (!token) return;
    localStorage.setItem('jwt_token', token);
    localStorage.setItem('access_token', token);
  }

  function buildQuery(query = {}) {
    const params = new URLSearchParams();
    Object.entries(query).forEach(([key, value]) => {
      if (value === undefined || value === null || value === '') return;
      params.set(key, value);
    });
    const text = params.toString();
    return text ? `?${text}` : '';
  }

  function makeUrl(path, query) {
    return `${getBaseUrl()}${path}${buildQuery(query)}`;
  }

  function toSnake(value) {
    if (Array.isArray(value)) return value.map(toSnake);
    if (!value || typeof value !== 'object' || value instanceof FormData) return value;

    return Object.entries(value).reduce((result, [key, item]) => {
      const snakeKey = key.replace(/[A-Z]/g, (char) => `_${char.toLowerCase()}`);
      result[snakeKey] = toSnake(item);
      return result;
    }, {});
  }

  function toCamel(value) {
    if (Array.isArray(value)) return value.map(toCamel);
    if (!value || typeof value !== 'object') return value;

    return Object.entries(value).reduce((result, [key, item]) => {
      const camelKey = key.replace(/_([a-z])/g, (_, char) => char.toUpperCase());
      result[camelKey] = toCamel(item);
      return result;
    }, {});
  }

  async function request(path, options = {}) {
    const {
      method = 'GET',
      query,
      body,
      headers = {},
      auth = true,
      snakeBody = false
    } = options;

    const fetchHeaders = { Accept: 'application/json', ...headers };
    const fetchOptions = { method, headers: fetchHeaders };
    const token = getToken();

    if (auth && token) fetchHeaders.Authorization = `Bearer ${token}`;

    if (body !== undefined && body !== null) {
      if (body instanceof FormData) {
        fetchOptions.body = body;
      } else {
        fetchHeaders['Content-Type'] = 'application/json';
        fetchOptions.body = JSON.stringify(snakeBody ? toSnake(body) : body);
      }
    }

    const response = await fetch(makeUrl(path, query), fetchOptions);
    const text = await response.text();
    let data = null;

    if (text) {
      try {
        data = JSON.parse(text);
      } catch (error) {
        data = { message: text };
      }
    }

    if (!response.ok) {
      const message = data?.message || data?.error || `HTTP ${response.status}`;
      const error = new Error(message);
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  }

  function listData(payload) {
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.data)) return payload.data;
    if (Array.isArray(payload?.items)) return payload.items;
    if (Array.isArray(payload?.content)) return payload.content;
    return [];
  }

  function totalCount(payload) {
    return Number(
      payload?.pagination?.total
      ?? payload?.total
      ?? payload?.total_count
      ?? payload?.totalCount
      ?? listData(payload).length
    ) || 0;
  }

  function idValue(value, prefix = '') {
    if (value === undefined || value === null || value === '') return '';
    const raw = String(value).replace(/^#/, '');
    if (prefix && raw.toUpperCase().startsWith(prefix.toUpperCase())) return raw;
    return `${prefix}${raw}`;
  }

  function dateOnly(value) {
    if (!value) return '';
    return String(value).slice(0, 10);
  }

  function mapProduct(product) {
    const variants = product.variants || [];
    const firstVariant = variants[0] || {};
    const stockFromVariants = variants.reduce((sum, variant) => sum + Number(variant.total_available ?? variant.totalAvailable ?? variant.stock ?? 0), 0);
    const stockValue = product.stock
      ?? product.total_available
      ?? product.totalAvailable
      ?? (variants.length ? stockFromVariants : undefined);
    const stockKnown = stockValue !== undefined && stockValue !== null;
    const minPrice = product.min_price ?? product.minPrice ?? firstVariant.price ?? product.price ?? 0;

    return {
      ...product,
      id: idValue(product.product_id ?? product.productId ?? product.id, 'SP'),
      product_id: product.product_id ?? product.productId ?? product.id,
      name: product.product_name || product.productName || product.name || '',
      product_name: product.product_name || product.productName || product.name || '',
      brand: product.brand || '',
      price: Number(minPrice) || 0,
      min_price: Number(minPrice) || 0,
      product_image_link: product.product_image_link || product.productImageLink || product.image || firstVariant.variant_image_link || firstVariant.variantImageLink || '',
      stock: stockKnown ? Number(stockValue) || 0 : null,
      stock_known: stockKnown,
      variants
    };
  }

  function productApiId(product) {
    const raw = product?.product_id ?? product?.productId ?? product?.id;
    if (raw === undefined || raw === null || raw === '') return '';
    const text = String(raw);
    return text.replace(/\D/g, '') || text;
  }

  async function listProductsWithDetails(query = {}, options = {}) {
    const payload = await request('/api/products', { query });
    const products = listData(payload);
    const limit = Number(options.limit ?? products.length);
    const hydrated = await Promise.all(products.map(async (product, index) => {
      const id = productApiId(product);
      if (!id || index >= limit) return product;

      try {
        return await request(`/api/products/${id}`);
      } catch (error) {
        return product;
      }
    }));

    if (Array.isArray(payload)) return hydrated;
    return { ...payload, data: hydrated };
  }

  function mapOrder(order) {
    const id = idValue(order.order_id ?? order.orderId ?? order.id, 'DH');
    return {
      ...order,
      id,
      order_id: order.order_id ?? order.orderId ?? order.id,
      customerName: order.receiver_name || order.receiverName || order.customerName || order.user_name || order.username || 'Kh\u00e1ch l\u1ebb',
      receiver_name: order.receiver_name || order.receiverName || order.customerName || 'Kh\u00e1ch l\u1ebb',
      receiver_phone: order.receiver_phone || order.receiverPhone || order.customerPhone || '',
      shipping_address: order.shipping_address || order.shippingAddress || order.customerAddress || '',
      date: dateOnly(order.order_date || order.orderDate || order.date),
      total: Number(order.total_amount ?? order.totalAmount ?? order.total ?? 0),
      total_amount: Number(order.total_amount ?? order.totalAmount ?? order.total ?? 0),
      discount_amount: Number(order.discount_amount ?? order.discountAmount ?? order.discount ?? 0),
      payment_method: order.payment_method || order.paymentMethod || '',
      order_status: order.order_status || order.orderStatus || order.status || 'WAIT',
      status: order.order_status || order.orderStatus || order.status || 'WAIT',
      is_paid: Boolean(order.is_paid ?? order.isPaid),
      items: order.items || order.order_details || order.orderDetails || []
    };
  }

  function mapUser(user) {
    return {
      ...user,
      id: user.user_id ?? user.userId ?? user.id,
      user_id: user.user_id ?? user.userId ?? user.id,
      name: user.name || user.full_name || user.fullName || user.username || '',
      username: user.username || '',
      email: user.email || '',
      phone_number: user.phone_number || user.phoneNumber || '',
      contact: user.email || user.phone_number || user.phoneNumber || '',
      role: user.role || user.roles || 'CUSTOMER',
      active: user.active !== false
    };
  }

  function mapDevice(device) {
    const warranty = device.warranty || {};
    return {
      ...device,
      device_id: device.device_id ?? device.deviceId,
      imei: device.imei || '',
      product_variant_id: device.product_variant_id ?? device.productVariantId,
      product_name: device.product_name || device.productName || '',
      status: device.status || 'AVAILABLE',
      warranty_start: warranty.start_date || warranty.startDate || device.warranty_start || device.warrantyStart,
      warranty_end: warranty.end_date || warranty.endDate || device.warranty_end || device.warrantyEnd,
      warranty_months: warranty.warranty_month || warranty.warrantyMonth || device.warranty_months || device.warrantyMonths
    };
  }

  const api = {
    isEnabled,
    setEnabled,
    getBaseUrl,
    setToken,
    getToken,
    request,
    toSnake,
    toCamel,
    listData,
    totalCount,
    mapProduct,
    mapOrder,
    mapUser,
    mapDevice,

    auth: {
      login: (body) => request('/api/auth/login', { method: 'POST', body, auth: false }),
      register: (body) => request('/api/auth/register', { method: 'POST', body, auth: false, snakeBody: true }),
      refresh: (refreshToken) => request('/api/auth/refresh', { method: 'POST', body: { refresh_token: refreshToken }, auth: false }),
      logout: (refreshToken) => request('/api/auth/logout', { method: 'POST', body: { refresh_token: refreshToken } })
    },

    products: {
      list: (query) => request('/api/products', { query }),
      listWithDetails: (query, options) => listProductsWithDetails(query, options),
      detail: (productId) => request(`/api/products/${productId}`),
      reviews: (productId, query) => request(`/api/products/${productId}/reviews`, { query }),
      createReview: (productId, body) => request(`/api/products/${productId}/reviews`, { method: 'POST', body, snakeBody: true })
    },

    cart: {
      get: () => request('/api/cart'),
      addItem: (body) => request('/api/cart/items', { method: 'POST', body, snakeBody: true }),
      updateItem: (cartDetailId, body) => request(`/api/cart/items/${cartDetailId}`, { method: 'PATCH', body, snakeBody: true }),
      removeItem: (cartDetailId) => request(`/api/cart/items/${cartDetailId}`, { method: 'DELETE' }),
      clear: () => request('/api/cart', { method: 'DELETE' })
    },

    orders: {
      create: (body) => request('/api/orders', { method: 'POST', body, snakeBody: true }),
      list: (query) => request('/api/orders', { query }),
      detail: (orderId) => request(`/api/orders/${orderId}`)
    },

    vouchers: {
      validate: (body) => request('/api/vouchers/validate', { method: 'POST', body, snakeBody: true })
    },

    me: {
      get: () => request('/api/me'),
      update: (body) => request('/api/me', { method: 'PATCH', body, snakeBody: true }),
      changePassword: (body) => request('/api/me/password', { method: 'PATCH', body, snakeBody: true })
    },

    staff: {
      orders: {
        updateStatus: (orderId, body) => request(`/api/staff/orders/${orderId}/status`, { method: 'PATCH', body, snakeBody: true }),
        createOffline: (body) => request('/api/staff/orders/offline', { method: 'POST', body, snakeBody: true })
      },
      warranty: {
        lookup: (imei) => request(`/api/staff/warranty/${imei}`)
      }
    },

    admin: {
      products: {
        create: (body) => request('/api/admin/products', { method: 'POST', body, snakeBody: true }),
        update: (productId, body) => request(`/api/admin/products/${productId}`, { method: 'PATCH', body, snakeBody: true }),
        remove: (productId) => request(`/api/admin/products/${productId}`, { method: 'DELETE' })
      },
      devices: {
        import: (body) => request('/api/admin/devices/import', { method: 'POST', body, snakeBody: true }),
        lookup: (imei) => request(`/api/admin/devices/${imei}`)
      },
      users: {
        list: (query) => request('/api/admin/users', { query }),
        detail: (userId) => request(`/api/admin/users/${userId}`),
        createStaff: (body) => request('/api/admin/users/staff', { method: 'POST', body, snakeBody: true }),
        update: (userId, body) => request(`/api/admin/users/${userId}`, { method: 'PATCH', body, snakeBody: true })
      },
      reports: {
        revenue: (query) => request('/api/admin/reports/revenue', { query }),
        topProducts: (query) => request('/api/admin/reports/top-products', { query })
      },
      orders: {
        updateStatus: (orderId, body) => request(`/api/staff/orders/${orderId}/status`, { method: 'PATCH', body, snakeBody: true })
      },
      vouchers: {
        create: (body) => request('/api/admin/vouchers', { method: 'POST', body, snakeBody: true }),
        extend: (voucherId, body) => request(`/api/admin/vouchers/${voucherId}/extend`, { method: 'PATCH', body, snakeBody: true })
      }
    }
  };

  global.HTApi = api;
})(window);
