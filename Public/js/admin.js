// Check admin auth
let currentUser = null;

document.addEventListener('DOMContentLoaded', async () => {
    currentUser = checkAdmin();

    if (currentUser) {
        await loadSensors();
        await loadLocations();
    }
});

// Load Sensors
async function loadSensors() {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/sensors', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const data = await response.json();

        if (response.ok) {
            renderSensorTable(data);
        }
    } catch (error) {
        console.error('Error loading sensors:', error);
    }
}

// Render Sensor Table
function renderSensorTable(sensors) {
    const tbody = document.getElementById('sensorTableBody');
    tbody.innerHTML = '';

    sensors.forEach(sensor => {
        const row = document.createElement('tr');

        const statusClass = sensor.Status.toLowerCase();
        const statusText = sensor.Status;

        row.innerHTML = `
            <td>${sensor.Id_sensor}</td>
            <td>${sensor.Nama_sensor}</td>
            <td>${sensor.location_name || 'Loading...'}</td>
            <td><span class="status-indicator ${statusClass}">${statusText}</span></td>
            <td>${new Date(sensor.Installed_at).toLocaleString('id-ID')}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn-icon edit" onclick="editSensor(${sensor.Id_sensor}, '${sensor.Nama_sensor}', '${sensor.Tipe}', ${sensor.Id_lokasi}, '${sensor.Status}')" title="Edit">
                        Edit
                    </button>
                    <button class="btn-icon delete" onclick="deleteSensor(${sensor.Id_sensor})" title="Hapus">
                        Delete
                    </button>
                </div>
            </td>
        `;

        tbody.appendChild(row);
    });
}

// Load Locations for dropdown
async function loadLocations() {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/locations', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const locations = await response.json();

        if (response.ok) {
            const select = document.getElementById('lokasi');
            select.innerHTML = '<option value="">Pilih Lokasi</option>';

            locations.forEach(loc => {
                const option = document.createElement('option');
                option.value = loc.Id_lokasi;
                option.textContent = loc.Nama_lokasi;
                select.appendChild(option);
            });
        }
    } catch (error) {
        console.error('Error loading locations:', error);
    }
}

// Open Modal
function openModal() {
    document.getElementById('modalTitle').textContent = 'Tambah Sensor';
    document.getElementById('sensorForm').reset();
    document.getElementById('sensorId').value = '';
    document.getElementById('sensorModal').classList.add('active');
}

// Close Modal
function closeModal() {
    document.getElementById('sensorModal').classList.remove('active');
}

// Edit Sensor
function editSensor(id, nama, tipe, lokasiId, status) {
    document.getElementById('modalTitle').textContent = 'Edit Sensor';
    document.getElementById('sensorId').value = id;
    document.getElementById('namaSensor').value = nama;
    document.getElementById('tipeSensor').value = tipe;
    document.getElementById('lokasi').value = lokasiId;
    document.getElementById('status').value = status;

    document.getElementById('sensorModal').classList.add('active');
}

const sensorForm = document.getElementById('sensorForm');
if (sensorForm) {
    sensorForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData);

        const id = data.Id_sensor;
        delete data.Id_sensor;

        try {
            const token = localStorage.getItem('token');
            const url = id
                ? `/api/sensors/${id}`
                : '/api/sensors';

            const method = id ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method: method,
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            if (response.ok) {
                alert('Sensor berhasil disimpan');
                closeModal();
                await loadSensors();
            } else {
                const error = await response.json();
                alert(error.message || 'Gagal menyimpan sensor');
            }
        } catch (error) {
            console.error('Error saving sensor:', error);
            alert('Terjadi kesalahan');
        }
    });
}

// Delete Sensor
async function deleteSensor(id) {
    if (!confirm('Apakah Anda yakin ingin menghapus sensor ini?')) {
        return;
    }

    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`/api/sensors/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            alert('Sensor berhasil dihapus');
            await loadSensors();
        } else {
            const error = await response.json();
            alert(error.message || 'Gagal menghapus sensor');
        }
    } catch (error) {
        console.error('Error deleting sensor:', error);
        alert('Terjadi kesalahan');
    }
}

// Close modal when clicking outside
window.onclick = function (event) {
    const modal = document.getElementById('sensorModal');
    if (event.target === modal) {
        closeModal();
    }
}