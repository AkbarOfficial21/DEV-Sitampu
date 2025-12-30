const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwmOwDGWk8IoY2xpBQORcTLaOnvhU0ZukEoQVYOl2LPosa0jbPuU1gzgSEIUsDmlhFj/exec'; 
// Ganti dengan URL Apps Script kamu jika berubah

// ================== AUTH & DASHBOARD ==================
window.addEventListener('DOMContentLoaded', async () => {
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  const path = window.location.pathname;

  // Proteksi dashboard
  if (path.includes('dashboard.html') && !user) {
    window.location.href = 'index.html';
    return;
  }

  // Isi data dashboard
  if (user && path.includes('dashboard.html')) {
    document.getElementById('welcome').textContent =
      `Selamat datang, ${user.nama} (${user.jabatan} ${user.instansi})`;

    document.getElementById('navName').textContent = user.nama;
    document.getElementById('navRole').textContent =
      `${user.jabatan} ${user.instansi}`;

    if (user.username === 'admin') {
      document.getElementById('adminPanel').classList.remove('hidden');
      loadUsers();
    }
  }
});

// ================== LOGIN (PERBAIKAN ERROR) ==================
async function login() {
  const username = document.getElementById('username')?.value.trim();
  const password = document.getElementById('password')?.value.trim();

  if (!username || !password) {
    alert('Username dan password wajib diisi');
    return;
  }

  try {
    const res = await fetch(SCRIPT_URL, {
      method: 'POST',
      body: JSON.stringify({
        action: 'login',
        username,
        password
      })
    });

    const data = await res.json();

    if (!data || !data.success) {
      alert(data?.message || 'Login gagal');
      return;
    }

    // Simpan user (dipakai oleh dashboard)
    localStorage.setItem('user', JSON.stringify(data.user));

    // Redirect
    window.location.href = 'dashboard.html';

  } catch (err) {
    console.error(err);
    alert('Terjadi kesalahan saat login');
  }
}

// ================== LOGOUT ==================
function logout() {
  localStorage.removeItem('user');
  window.location.href = 'index.html';
}

// ================== ADMIN USERS ==================
async function loadUsers() {
  const res = await fetch(SCRIPT_URL, {
    method: 'POST',
    body: JSON.stringify({ action: 'getUsers' })
  });

  const users = await res.json();
  const tbody = document.querySelector('#userTable tbody');
  tbody.innerHTML = '';

  users.forEach(u => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${u[0]}</td>
      <td>${u[2]}</td>
      <td>${u[3]}</td>
      <td>${u[4]}</td>
      <td>
        <button onclick="openEditModal('${u[0]}','${u[1]}','${u[2]}','${u[3]}','${u[4]}')">Edit</button>
        <button onclick="deleteUser('${u[0]}')">Hapus</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

async function addUser() {
  const username = document.getElementById('newUsername').value.trim();
  const password = document.getElementById('newPassword').value.trim();
  const nama = document.getElementById('newNama').value.trim();
  const jabatan = document.getElementById('newJabatan').value;
  const instansi = document.getElementById('newInstansi').value.trim();

  if (!username || !password || !nama || !instansi) {
    alert('Lengkapi semua field!');
    return;
  }

  await fetch(SCRIPT_URL, {
    method: 'POST',
    body: JSON.stringify({
      action: 'addUser',
      username,
      password,
      nama,
      jabatan,
      instansi
    })
  });

  alert('User berhasil ditambahkan');
  loadUsers();
}

async function deleteUser(username) {
  if (!confirm(`Hapus user ${username}?`)) return;

  await fetch(SCRIPT_URL, {
    method: 'POST',
    body: JSON.stringify({ action: 'deleteUser', username })
  });

  alert('User dihapus');
  loadUsers();
}

// ================== MODAL EDIT ==================
function openEditModal(username, password, nama, jabatan, instansi) {
  document.getElementById('editModal').classList.remove('hidden');
  document.getElementById('oldUsername').value = username;
  document.getElementById('editUsername').value = username;
  document.getElementById('editPassword').value = password;
  document.getElementById('editNama').value = nama;
  document.getElementById('editJabatan').value = jabatan;
  document.getElementById('editInstansi').value = instansi;
}

function closeModal() {
  document.getElementById('editModal').classList.add('hidden');
}

async function saveEdit() {
  const oldUsername = document.getElementById('oldUsername').value;
  const username = document.getElementById('editUsername').value.trim();
  const password = document.getElementById('editPassword').value.trim();
  const nama = document.getElementById('editNama').value.trim();
  const jabatan = document.getElementById('editJabatan').value;
  const instansi = document.getElementById('editInstansi').value.trim();

  if (!username || !password || !nama || !instansi) {
    alert('Lengkapi semua field!');
    return;
  }

  await fetch(SCRIPT_URL, {
    method: 'POST',
    body: JSON.stringify({
      action: 'editUser',
      oldUsername,
      username,
      password,
      nama,
      jabatan,
      instansi
    })
  });

  alert('User berhasil diperbarui');
  closeModal();
  loadUsers();
}

