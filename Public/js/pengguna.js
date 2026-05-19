document.addEventListener('DOMContentLoaded', () => {
    checkAdmin();
    loadUsers();

    // Event Listener for Form Submit
    document.getElementById('userForm').addEventListener('submit', handleFormSubmit);
});

async function loadUsers() {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/users', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (!response.ok) throw new Error('Gagal memuat data pengguna');
        
        const users = await response.json();
        const tbody = document.getElementById('userTableBody');
        tbody.innerHTML = '';
        
        users.forEach(user => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${user.Id_user}</td>
                <td>${user.Nama}</td>
                <td>${user.Email}</td>
                <td><span class="status-badge ${user.Role.toLowerCase()}">${user.Role}</span></td>
                <td>
                    <div class="action-buttons">
                        <button class="btn-icon edit" onclick="editUser(${user.Id_user}, '${user.Nama}', '${user.Email}', '${user.Role}')" title="Edit">Edit</button>
                        <button class="btn-icon delete" onclick="deleteUser(${user.Id_user})" title="Hapus">Delete</button>
                    </div>
                </td>
            `;
            tbody.appendChild(tr);
        });
    } catch (error) {
        console.error(error);
        alert('Terjadi kesalahan saat memuat data pengguna.');
    }
}

function openModal() {
    document.getElementById('modalTitle').textContent = 'Tambah Pengguna';
    document.getElementById('userForm').reset();
    document.getElementById('userId').value = '';
    document.getElementById('password').required = true; // Wajib isi jika buat baru
    document.getElementById('passwordLabel').textContent = 'Password (Minimal 6 karakter)';
    document.getElementById('userModal').classList.add('active');
}

function closeModal() {
    document.getElementById('userModal').classList.remove('active');
}

function editUser(id, nama, email, role) {
    document.getElementById('modalTitle').textContent = 'Edit Pengguna';
    document.getElementById('userId').value = id;
    document.getElementById('nama').value = nama;
    document.getElementById('email').value = email;
    document.getElementById('role').value = role;
    
    // Saat edit, password opsional
    document.getElementById('password').required = false; 
    document.getElementById('passwordLabel').textContent = 'Password Baru (Kosongkan jika tidak diubah)';
    
    document.getElementById('userModal').classList.add('active');
}

async function handleFormSubmit(e) {
    e.preventDefault();
    
    const id = document.getElementById('userId').value;
    const isEdit = id !== '';
    const password = document.getElementById('password').value;

    if (!isEdit && password.length < 6) {
        alert('Password wajib diisi minimal 6 karakter!');
        return;
    }

    const formData = {
        Nama: document.getElementById('nama').value,
        Email: document.getElementById('email').value,
        Role: document.getElementById('role').value,
        Password: password
    };
    
    try {
        const token = localStorage.getItem('token');
        const url = isEdit ? `/api/users/${id}` : '/api/users';
        const method = isEdit ? 'PUT' : 'POST';
        
        const response = await fetch(url, {
            method: method,
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });
        
        const data = await response.json();
        if (response.ok) {
            alert(data.message);
            closeModal();
            loadUsers();
        } else {
            alert(data.message || 'Gagal menyimpan pengguna');
        }
    } catch (error) {
        console.error(error);
        alert('Terjadi kesalahan sistem.');
    }
}

async function deleteUser(id) {
    if (!confirm('Apakah Anda yakin ingin menghapus pengguna ini secara permanen?')) return;
    
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`/api/users/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        const data = await response.json();
        if (response.ok) {
            alert(data.message);
            loadUsers();
        } else {
            alert(data.message || 'Gagal menghapus pengguna');
        }
    } catch (error) {
        console.error(error);
        alert('Terjadi kesalahan sistem.');
    }
}
