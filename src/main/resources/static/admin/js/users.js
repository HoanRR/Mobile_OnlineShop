/**
 * Users page script
 * Mock staff/customer management while backend APIs are not connected.
 */

const USERS_STORAGE_KEY = 'ht_admin_users';

const defaultUsers = [
  {
    id: 1,
    name: 'Nguy\u1ec5n Ph\u00fac Vinh',
    contact: 'thuy.npv@htmobile.com',
    role: 'admin',
    permission: 'Admin',
    active: true
  },
  {
    id: 2,
    name: 'Nguy\u1ec5n Th\u1ecb Nga',
    contact: 'duyen.htt@htmobile.com',
    role: 'staff',
    permission: 'Nh\u00e2n vi\u00ean b\u00e1n h\u00e0ng',
    active: true
  },
  {
    id: 3,
    name: 'L\u00ea Th\u1ecb H\u1ed3ng H\u1ea1nh',
    contact: '0987654321',
    role: 'customer',
    permission: 'Kh\u00e1ch h\u00e0ng',
    active: false
  }
];

let users = [];
let editingUserId = null;

function useUsersApi() {
  return Boolean(window.HTApi?.isEnabled());
}

function initCommonUI() {
  const sidebar = document.getElementById('sidebar');
  const mainContent = document.getElementById('mainContent');
  const toggleBtn = document.getElementById('sidebarToggle');

  if (sidebar && mainContent && toggleBtn) {
    const collapsedKey = 'ht_sidebar_collapsed';
    if (localStorage.getItem(collapsedKey) === '1') {
      sidebar.classList.add('collapsed');
      mainContent.classList.add('expanded');
    }

    toggleBtn.addEventListener('click', () => {
      const isCollapsed = sidebar.classList.toggle('collapsed');
      mainContent.classList.toggle('expanded', isCollapsed);
      localStorage.setItem(collapsedKey, isCollapsed ? '1' : '0');
    });
  }

  const dateEl = document.getElementById('currentDate');
  if (dateEl) {
    dateEl.textContent = new Date().toLocaleDateString('vi-VN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  const logoutBtn = document.querySelector('.logout a');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', (event) => {
      event.preventDefault();
      localStorage.removeItem('jwt_token');
      localStorage.removeItem('user_role');
      window.location.href = '../login.html';
    });
  }
}

async function loadUsers(query = {}) {
  if (useUsersApi()) {
    try {
      const response = await HTApi.admin.users.list({ page: 1, limit: 100, ...query });
      users = HTApi.listData(response).map(HTApi.mapUser);
      return;
    } catch (error) {
      console.warn('Không lấy được người dùng từ API, dùng dữ liệu mock.', error);
    }
  }

  try {
    const saved = JSON.parse(localStorage.getItem(USERS_STORAGE_KEY) || 'null');
    users = Array.isArray(saved) && saved.length ? saved : [...defaultUsers];
  } catch (error) {
    users = [...defaultUsers];
  }

  saveUsers();
}

function saveUsers() {
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
}

function normalizeText(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

function getRoleLabel(role) {
  const key = roleKey(role);
  const labels = {
    admin: 'Admin',
    staff: 'Nh\u00e2n vi\u00ean',
    customer: 'Kh\u00e1ch h\u00e0ng'
  };
  return labels[key] || role;
}

function roleKey(role) {
  const normalized = normalizeText(role);
  if (normalized === 'admin') return 'admin';
  if (normalized === 'employee' || normalized === 'staff' || normalized === 'nhan vien') return 'staff';
  if (normalized === 'customer' || normalized === 'khach hang') return 'customer';
  return normalized;
}

function apiRoleValue(role) {
  const key = roleKey(role);
  if (key === 'admin') return 'ADMIN';
  if (key === 'staff') return 'EMPLOYEE';
  if (key === 'customer') return 'CUSTOMER';
  return role || '';
}

function getRoleBadge(user) {
  const key = roleKey(user.role);
  if (key === 'admin') {
    return '<span style="background:rgba(156,39,176,0.2); color:#e040fb; padding:4px 10px; border-radius:6px; font-size:12px; font-weight:600;">Admin</span>';
  }

  if (key === 'staff') {
    return '<span class="badge role-staff">Nh\u00e2n vi\u00ean</span>';
  }

  return '<span style="background:rgba(255,255,255,0.1); color:var(--text); padding:4px 10px; border-radius:6px; font-size:12px; font-weight:600;">Kh\u00e1ch h\u00e0ng</span>';
}

function getStatusCell(user) {
  if (user.active) {
    return '<td><span class="status-active">Ho\u1ea1t \u0111\u1ed9ng</span></td>';
  }

  return '<td><span class="status-banned">B\u1ecb kh\u00f3a</span></td>';
}

function getActionCell(user) {
  if (roleKey(user.role) === 'admin') {
    return `<button class="btn-edit" data-action="edit" data-id="${user.id}">S\u1eeda</button>`;
  }

  const lockButton = user.active
    ? `<button class="btn-ban" data-action="toggle" data-id="${user.id}"><i class="fa-solid fa-lock"></i> Kh\u00f3a</button>`
    : `<button class="btn-edit" data-action="toggle" data-id="${user.id}" style="color:var(--green); border-color:var(--green);"><i class="fa-solid fa-unlock"></i> M\u1edf kh\u00f3a</button>`;

  return `<div class="action-btns"><button class="btn-edit" data-action="edit" data-id="${user.id}">S\u1eeda</button>${lockButton}</div>`;
}

function getFilteredUsers() {
  const filterBar = document.querySelector('.filter-bar');
  const searchInput = filterBar ? filterBar.querySelector('input') : null;
  const roleSelect = filterBar ? filterBar.querySelector('select') : null;
  const keyword = normalizeText(searchInput ? searchInput.value : '');
  const selectedRole = normalizeText(roleSelect ? roleSelect.value : '');

  return users.filter((user) => {
    const matchesKeyword = !keyword
      || normalizeText(user.name).includes(keyword)
      || normalizeText(user.contact).includes(keyword)
      || normalizeText(user.permission).includes(keyword);

    const matchesRole = !selectedRole
      || normalizeText(getRoleLabel(user.role)) === selectedRole
      || normalizeText(user.role) === selectedRole
      || roleKey(user.role) === selectedRole;

    return matchesKeyword && matchesRole;
  });
}

function ensureCustomerRoleOption() {
  const roleSelect = document.querySelector('.filter-bar select');
  if (!roleSelect) return;

  const hasCustomer = Array.from(roleSelect.options).some((option) => normalizeText(option.value || option.textContent) === 'khach hang');
  if (hasCustomer) return;

  const option = document.createElement('option');
  option.value = 'Kh\u00e1ch h\u00e0ng';
  option.textContent = 'Kh\u00e1ch h\u00e0ng';
  roleSelect.appendChild(option);
}

function applyUserQueryFilters() {
  const params = new URLSearchParams(window.location.search);
  const role = normalizeText(params.get('role') || '');
  const query = params.get('q') || '';
  const filterBar = document.querySelector('.filter-bar');
  const searchInput = filterBar ? filterBar.querySelector('input') : null;
  const roleSelect = filterBar ? filterBar.querySelector('select') : null;

  if (query && searchInput) searchInput.value = query;
  if (!role || !roleSelect) return;

  const matchingOption = Array.from(roleSelect.options).find((option) => {
    const value = normalizeText(option.value || option.textContent);
    return value === role || value === normalizeText(getRoleLabel(role));
  });

  if (matchingOption) {
    roleSelect.value = matchingOption.value || matchingOption.textContent;
  }
}

function renderUsers() {
  const tableBody = document.querySelector('.admin-table tbody');
  if (!tableBody) return;

  const filteredUsers = getFilteredUsers();

  if (!filteredUsers.length) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="5" style="text-align:center; color:var(--muted); padding:28px;">Kh\u00f4ng t\u00ecm th\u1ea5y ng\u01b0\u1eddi d\u00f9ng ph\u00f9 h\u1ee3p</td>
      </tr>
    `;
    return;
  }

  tableBody.innerHTML = filteredUsers.map((user) => `
    <tr>
      <td style="color:var(--text); font-weight:500;">${user.name}</td>
      <td style="color:var(--muted)">${user.contact}</td>
      <td>${getRoleBadge(user)}</td>
      ${getStatusCell(user)}
      <td>${getActionCell(user)}</td>
    </tr>
  `).join('');
}

function openStaffModal(user = null) {
  const modal = document.getElementById('staffModal');
  const form = modal ? modal.querySelector('form') : null;
  if (!modal || !form) return;

  editingUserId = user ? user.id : null;
  const title = modal.querySelector('.modal-header h3');
  const submitButton = form.querySelector('button[type="submit"]');
  const inputs = form.querySelectorAll('input, select');

  if (title) title.textContent = user ? 'S\u1eeda nh\u00e2n vi\u00ean' : 'Th\u00eam Nh\u00e2n Vi\u00ean';
  if (submitButton) submitButton.textContent = user ? 'L\u01b0u thay \u0111\u1ed5i' : 'T\u1ea1o t\u00e0i kho\u1ea3n';

  if (inputs[0]) inputs[0].value = user ? user.name : '';
  if (inputs[1]) inputs[1].value = user ? user.username || normalizeText(user.name).replace(/\s+/g, '.') : '';
  if (inputs[2]) inputs[2].value = user ? user.email || user.contact : '';
  if (inputs[3]) inputs[3].value = user ? user.phone_number || '' : '';
  if (inputs[4]) inputs[4].value = '';
  if (inputs[5]) inputs[5].value = user && normalizeText(user.permission) === 'quan ly kho' ? 'Qu\u1ea3n l\u00fd kho' : 'Nh\u00e2n vi\u00ean b\u00e1n h\u00e0ng';

  modal.style.display = 'flex';
  if (inputs[0]) inputs[0].focus();
}

function closeStaffModal() {
  const modal = document.getElementById('staffModal');
  const form = modal ? modal.querySelector('form') : null;
  if (form) form.reset();
  if (modal) modal.style.display = 'none';
  editingUserId = null;
}

async function handleStaffFormSubmit(event) {
  event.preventDefault();

  const form = event.currentTarget;
  const fields = form.querySelectorAll('input, select');
  const name = fields[0] ? fields[0].value.trim() : '';
  const username = fields[1] ? fields[1].value.trim() : '';
  const email = fields[2] ? fields[2].value.trim() : '';
  const phoneNumber = fields[3] ? fields[3].value.trim() : '';
  const password = fields[4] ? fields[4].value : '';
  const permission = fields[5] ? fields[5].value.trim() : 'Nh\u00e2n vi\u00ean b\u00e1n h\u00e0ng';

  if (!name || !username || !email || !phoneNumber) {
    alert('Vui l\u00f2ng nh\u1eadp \u0111\u1ea7y \u0111\u1ee7 h\u1ecd t\u00ean, username, email v\u00e0 s\u1ed1 \u0111i\u1ec7n tho\u1ea1i.');
    return;
  }

  const duplicated = users.some((user) => user.id !== editingUserId
    && (
      normalizeText(user.username) === normalizeText(username)
      || normalizeText(user.email || user.contact) === normalizeText(email)
      || normalizeText(user.phone_number) === normalizeText(phoneNumber)
    ));
  if (duplicated) {
    alert('Username, email ho\u1eb7c s\u1ed1 \u0111i\u1ec7n tho\u1ea1i n\u00e0y \u0111\u00e3 t\u1ed3n t\u1ea1i.');
    return;
  }

  const wasEditing = Boolean(editingUserId);

  if (editingUserId) {
    if (useUsersApi()) {
      try {
        await HTApi.admin.users.update(editingUserId, {
          phone_number: phoneNumber,
          role: 'EMPLOYEE'
        });
      } catch (error) {
        alert(error.message || 'Không cập nhật được người dùng qua API.');
        return;
      }
    }

    users = users.map((user) => user.id === editingUserId
      ? { ...user, name, username, email, phone_number: phoneNumber, contact: email, permission, ...(password ? { password } : {}) }
      : user);
  } else {
    const newUserId = Date.now();
    if (useUsersApi()) {
      try {
        await HTApi.admin.users.createStaff({
          username,
          email,
          phone_number: phoneNumber,
          password,
          role: 'EMPLOYEE'
        });
      } catch (error) {
        alert(error.message || 'Không tạo được nhân viên qua API.');
        return;
      }
    }

    users.unshift({
      id: newUserId,
      user_id: newUserId,
      name,
      username,
      email,
      phone_number: phoneNumber,
      password,
      contact: email,
      role: 'EMPLOYEE',
      permission,
      active: true
    });
  }

  saveUsers();
  renderUsers();
  closeStaffModal();
  alert(wasEditing ? '\u0110\u00e3 c\u1eadp nh\u1eadt nh\u00e2n vi\u00ean.' : '\u0110\u00e3 t\u1ea1o nh\u00e2n vi\u00ean m\u1edbi.');
}

function handleTableAction(event) {
  const button = event.target.closest('button[data-action]');
  if (!button) return;

  const userId = Number(button.dataset.id);
  const user = users.find((item) => item.id === userId);
  if (!user) return;

  if (button.dataset.action === 'edit') {
    openStaffModal(user);
    return;
  }

  if (button.dataset.action === 'toggle') {
    const nextActive = !user.active;
    const message = nextActive
      ? `M\u1edf kh\u00f3a t\u00e0i kho\u1ea3n ${user.name}?`
      : `Kh\u00f3a t\u00e0i kho\u1ea3n ${user.name}?`;

    if (confirm(message)) {
      user.active = nextActive;
      saveUsers();
      renderUsers();
    }
  }
}

function initUserPageEvents() {
  const addButton = document.querySelector('.page-body .btn-add');
  const modal = document.getElementById('staffModal');
  const form = modal ? modal.querySelector('form') : null;
  const tableBody = document.querySelector('.admin-table tbody');
  const filterBar = document.querySelector('.filter-bar');
  const filterButton = filterBar ? filterBar.querySelector('button') : null;

  if (addButton) {
    addButton.onclick = null;
    addButton.addEventListener('click', () => openStaffModal());
  }

  if (form) {
    form.addEventListener('submit', handleStaffFormSubmit);
  }

  if (modal) {
    modal.querySelectorAll('button').forEach((button) => {
      if (button.type === 'button' || button.textContent.trim() === '\u00d7') {
        button.onclick = null;
        button.addEventListener('click', closeStaffModal);
      }
    });

    modal.addEventListener('click', (event) => {
      if (event.target === modal) closeStaffModal();
    });
  }

  if (tableBody) {
    tableBody.addEventListener('click', handleTableAction);
  }

  if (filterButton) {
    filterButton.addEventListener('click', async () => {
      if (useUsersApi()) {
        const roleSelect = filterBar ? filterBar.querySelector('select') : null;
        await loadUsers({ role: roleSelect ? apiRoleValue(roleSelect.value) : '' });
      }
      renderUsers();
    });
  }

  const searchInput = filterBar ? filterBar.querySelector('input') : null;
  if (searchInput) {
    searchInput.addEventListener('keydown', async (event) => {
      if (event.key === 'Enter') {
        if (useUsersApi()) await loadUsers({ search: searchInput.value.trim() });
        renderUsers();
      }
    });
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  initCommonUI();
  await loadUsers();
  ensureCustomerRoleOption();
  applyUserQueryFilters();
  initUserPageEvents();
  renderUsers();
});
