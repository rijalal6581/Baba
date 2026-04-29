// Navigasi SPA (Mencegah reload dan handle Auth flow)
function navigasi(id) {
  // Logic untuk ngecek auth sebelum buka form daftar
  if (id === 'daftar' && !localStorage.getItem('loginUser')) {
    alert("Anda harus Login terlebih dahulu untuk mendaftar!");
    toggleAuthView('register');
    id = 'auth'; // Arahkan ke halaman auth
  }

  // Jika klik tombol login di navbar
  if (id === 'auth_login') {
    toggleAuthView('login');
    id = 'auth';
  }

  // Handle Logout
  if (id === 'auth_logout') {
    localStorage.removeItem('loginUser');
    alert("Berhasil Logout.");
    checkNavAuth();
    id = 'home';
  }

  // Menyembunyikan semua section (display: none)
  document.querySelectorAll('.page-section').forEach(sec => {
    sec.classList.remove('active', 'page-enter');
  });

  // Tampilkan section yang dituju
  const target = document.getElementById(id);
  if(target) {
    target.classList.add('active');
    // Memicu reflow agar animasi CSS berjalan ulang
    void target.offsetWidth; 
    target.classList.add('page-enter');
  }

  // Tampilkan user email jika di halaman daftar
  if (id === 'daftar') {
    document.getElementById('loggedUserDisplay').innerText = localStorage.getItem('loginUser');
  }

  // Update Navbar Active State
  document.querySelectorAll('.navbar-nav .nav-link').forEach(link => {
    link.classList.remove('active');
    if (link.getAttribute('onclick') && link.getAttribute('onclick').includes(`'${id}'`)) {
      link.classList.add('active');
    }
  });

  // Perbarui chart jika membuka beranda
  if (id === 'home') {
    updateDashboard();
  }

  // Scroll ke atas
  window.scrollTo({ top: 0, behavior: 'smooth' });

  // Tutup collapse menu di mobile
  const navbarCollapse = document.getElementById('navbarContent');
  if(navbarCollapse && navbarCollapse.classList.contains('show')) {
    bootstrap.Collapse.getInstance(navbarCollapse).hide();
  }
}

// Light / Dark Mode Toggle Bootstrap 5
function toggleMode() {
  const htmlEl = document.documentElement;
  const currentTheme = htmlEl.getAttribute('data-bs-theme');
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  htmlEl.setAttribute('data-bs-theme', newTheme);
  
  const icon = document.querySelector('#themeToggle i');
  if (newTheme === 'dark') {
    icon.classList.remove('bi-moon-stars');
    icon.classList.add('bi-sun');
  } else {
    icon.classList.remove('bi-sun');
    icon.classList.add('bi-moon-stars');
  }
}

// Tampilan Switch antara Register & Login di halaman Auth
function toggleAuthView(view) {
  const loginForm = document.getElementById('loginFormContainer');
  const registerForm = document.getElementById('registerFormContainer');
  
  if (view === 'register') {
    loginForm.classList.add('d-none');
    registerForm.classList.remove('d-none');
  } else {
    registerForm.classList.add('d-none');
    loginForm.classList.remove('d-none');
  }
}

// Cek status autentikasi di Navbar
function checkNavAuth() {
  const authMenu = document.getElementById('authMenu');
  const isLogged = localStorage.getItem('loginUser');
  if (isLogged) {
    let emailPrefix = isLogged.split('@')[0];
    authMenu.innerHTML = `<button class="btn btn-outline-light rounded-pill px-3" onclick="navigasi('auth_logout')"><i class="bi bi-box-arrow-right me-1"></i>Logout (${emailPrefix})</button>`;
  } else {
    authMenu.innerHTML = `<button class="btn btn-light text-danger fw-bold rounded-pill px-3" onclick="navigasi('auth_login')"><i class="bi bi-box-arrow-in-right me-1"></i>Login</button>`;
  }
}

// FUNGSI AUTENTIKASI (Simulasi LocalStorage)
function register() {
  let email = document.getElementById('regEmail').value.trim();
  let pass = document.getElementById('regPass').value.trim();
  
  if(!email || !pass) return alert("Email dan Password wajib diisi!");
  if(pass.length < 6) return alert("Password minimal 6 karakter!");

  let users = JSON.parse(localStorage.getItem('akunSanggar')) || [];
  if(users.find(u => u.email === email)) return alert("Email sudah terdaftar!");

  users.push({ email: email, pass: pass });
  localStorage.setItem('akunSanggar', JSON.stringify(users));
  
  alert("Akun berhasil dibuat! Silakan Login.");
  
  // Clear input
  document.getElementById('regEmail').value = '';
  document.getElementById('regPass').value = '';
  
  // Beralih ke form login
  toggleAuthView('login');
}

function login() {
  let email = document.getElementById('loginEmail').value.trim();
  let pass = document.getElementById('loginPass').value.trim();

  if(!email || !pass) return alert("Email dan Password wajib diisi!");

  let users = JSON.parse(localStorage.getItem('akunSanggar')) || [];
  let user = users.find(u => u.email === email && u.pass === pass);

  if(user) {
    localStorage.setItem('loginUser', user.email);
    alert("Login berhasil! Mengarahkan ke form Pendaftaran.");
    checkNavAuth();
    // Bersihkan form
    document.getElementById('loginEmail').value = '';
    document.getElementById('loginPass').value = '';
    // Arahkan ke halaman Daftar
    navigasi('daftar');
  } else {
    alert("Email atau Password salah!");
  }
}

// FUNGSI PENDAFTARAN ANGGOTA & DASHBOARD STATS
function simpanDaftar() {
  let nama = document.getElementById('nama').value.trim();
  let kelas = document.getElementById('kelas').value;
  let jk = document.getElementById('jk').value;
  let wa = document.getElementById('waUser').value.trim();

  if(!nama || !kelas || !jk || !wa) return alert("Lengkapi semua form pendaftaran!");

  let dataDaftar = JSON.parse(localStorage.getItem('dataSanggar')) || [];
  dataDaftar.push({ nama, kelas, jk, wa });
  localStorage.setItem('dataSanggar', JSON.stringify(dataDaftar));

  alert("Data Pendaftaran Berhasil Disimpan di Sistem!");
  
  // Update statistik
  updateDashboard();
  
  // Kembalikan ke beranda
  navigasi('home');
  
  // Clear form
  document.getElementById('nama').value = '';
  document.getElementById('kelas').value = '';
  document.getElementById('jk').value = '';
  document.getElementById('waUser').value = '';
}

function kirimWA() {
  let nama = document.getElementById('nama').value.trim();
  let kelas = document.getElementById('kelas').value;
  let jk = document.getElementById('jk').value;
  let wa = document.getElementById('waUser').value.trim();

  if(!nama || !kelas || !jk || !wa) return alert("Lengkapi semua form sebelum mengirim konfirmasi via WA!");

  let pesan = `Halo Admin Sanggar Panglimah,%0ASaya ingin konfirmasi pendaftaran:%0A%0A*Nama*: ${nama}%0A*Kelas*: ${kelas}%0A*Gender*: ${jk}%0A*No WA*: ${wa}%0A%0AMohon info selanjutnya. Terima kasih.`;
  
  window.open("https://wa.me/6285609213828?text=" + pesan, "_blank");
}

function updateDashboard() {
  let dataDaftar = JSON.parse(localStorage.getItem('dataSanggar')) || [];
  
  document.getElementById('totalUser').innerText = dataDaftar.length;
  
  let countLaki = dataDaftar.filter(x => x.jk === "Laki-laki").length;
  let countPr = dataDaftar.filter(x => x.jk === "Perempuan").length;
  
  document.getElementById('totalL').innerText = countLaki;
  document.getElementById('totalP').innerText = countPr;

  // Render Chart
  let ctx = document.getElementById('chart').getContext('2d');
  if (window.myChart) {
    window.myChart.destroy();
  }

  window.myChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Laki-laki', 'Perempuan'],
      datasets: [{
        data: [countLaki, countPr],
        backgroundColor: ['#0d6efd', '#198754'],
        hoverOffset: 4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'bottom', labels: { color: document.documentElement.getAttribute('data-bs-theme')==='dark'?'#fff':'#333' } }
      }
    }
  });
}

// Inisialisasi awal saat load
document.addEventListener('DOMContentLoaded', () => {
  // Mencegah flash tampilan
  document.querySelectorAll('.page-section').forEach(s => s.classList.remove('active'));
  document.getElementById('home').classList.add('active');
  
  checkNavAuth();
  updateDashboard();
});
