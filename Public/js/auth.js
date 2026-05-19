function togglePassword(inputId) {
    const input = document.getElementById(inputId);
    const button = input.nextElementSibling;
    if (!input || !button) return;
    if (input.type === 'password') {
        input.type = 'text';
        button.textContent = 'Hide';
    } else {
        input.type = 'password';
        button.textContent = 'Show';
    }
}

const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = {
            email: document.getElementById('email').value,
            password: document.getElementById('password').value,
            remember: document.getElementById('remember')?.checked || false
        };
        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            const data = await response.json();
            if (response.ok) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                if (formData.remember) localStorage.setItem('remember', 'true');
                if (data.user.Role === 'Admin') {
                    window.location.href = '/admin';
                } else if (data.user.Role === 'Analis') {
                    window.location.href = '/analis';
                } else {
                    window.location.href = '/dashboard';
                }
            } else {
                alert(data.message || 'Login gagal');
            }
        } catch (error) {
            alert('Terjadi kesalahan. Pastikan server berjalan.');
        }
    });
}

const registerForm = document.getElementById('registerForm');
if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        if (password !== confirmPassword) { alert('Password tidak cocok!'); return; }
        if (password.length < 6) { alert('Password minimal 6 karakter!'); return; }

        const formData = {
            Nama: document.getElementById('nama').value,
            Email: document.getElementById('email').value,
            Password: password
        };
        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            const data = await response.json();
            if (response.ok) {
                alert('Registrasi berhasil! Silakan login.');
                window.location.href = '/login';
            } else {
                alert(data.message || 'Registrasi gagal');
            }
        } catch (error) {
            alert('Terjadi kesalahan. Pastikan server berjalan.');
        }
    });
}

function checkAuth() {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user'));
    if (!token || !user) {
        window.location.href = '/login';
        return null;
    }
    return user;
}

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('remember');
    window.location.href = '/login';
}

function checkAdmin() {
    const user = checkAuth();
    if (user && user.Role !== 'Admin') {
        alert('Akses ditolak. Hanya admin yang dapat mengakses halaman ini.');
        window.location.href = '/dashboard';
        return false;
    }
    return user;
}

document.addEventListener('DOMContentLoaded', () => {
    const userStr = localStorage.getItem('user');
    const sidebarNav = document.querySelector('.sidebar-nav');

    if (userStr && sidebarNav) {
        try {
            const user = JSON.parse(userStr);
            const currentPath = window.location.pathname;

            let navHtml = '';

            if (user.Role === 'Admin') {
                navHtml = `
                    <a href="/dashboard" class="nav-item ${currentPath === '/dashboard' || currentPath === '/' ? 'active' : ''}">
                        <span>Dashboard Utama</span>
                    </a>
                    <a href="/analis" class="nav-item ${currentPath === '/analis' ? 'active' : ''}">
                        <span>Laporan & Riwayat</span>
                    </a>
                    <a href="/admin" class="nav-item ${currentPath === '/admin' ? 'active' : ''}">
                        <span>Kelola Sensor</span>
                    </a>
                    <a href="/pengguna" class="nav-item ${currentPath === '/pengguna' ? 'active' : ''}">
                        <span>Pengguna</span>
                    </a>`;
            } else if (user.Role === 'Analis') {
                navHtml = `
                    <a href="/dashboard" class="nav-item ${currentPath === '/dashboard' || currentPath === '/' ? 'active' : ''}">
                        <span>Dashboard Utama</span>
                    </a>
                    <a href="/analis" class="nav-item ${currentPath === '/analis' ? 'active' : ''}">
                        <span>Laporan & Riwayat</span>
                    </a>
                `;
            } else {
                navHtml = `
                    <a href="/dashboard" class="nav-item active">
                        <span>Dashboard Utama</span>
                    </a>
                `;
            }

            sidebarNav.innerHTML = navHtml;

        } catch (e) {
            console.error('Error parsing user data', e);
        }
    }
});
