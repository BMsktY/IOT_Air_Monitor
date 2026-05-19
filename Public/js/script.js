// Check authentication on page load
let currentUser = null;

document.addEventListener('DOMContentLoaded', async () => {
    currentUser = checkAuth();
    
    if (currentUser) {
        // Update user info di header
        const userInfo = document.getElementById('userInfo');
        if (userInfo) {
            userInfo.querySelector('span').textContent = currentUser.Nama;
        }
        
        // Show admin menu jika user adalah admin
        const adminMenu = document.getElementById('adminMenu');
        if (adminMenu && currentUser.Role === 'Admin') {
            adminMenu.style.display = 'flex';
        }
        
        // Load dashboard data
        await loadDashboardData();
    }
});

// Load Dashboard Data
async function loadDashboardData() {
    try {
        const token = localStorage.getItem('token');
        
        // Fetch sensor data
        const response = await fetch('/api/sensor-data/latest', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        const data = await response.json();
        
        if (response.ok) {
            updateDashboardUI(data);
            await loadChart();
        }
    } catch (error) {
        console.error('Error loading dashboard:', error);
    }
}

// Update Dashboard UI
function updateDashboardUI(apiData) {
    // Handle both object and array response formats
    const data = Array.isArray(apiData) ? apiData : apiData.data || [];
    const sensor = !Array.isArray(apiData) ? apiData.sensor : null;
    const location = !Array.isArray(apiData) ? apiData.location : null;
    
    const latestData = data && data.length > 0 ? data[data.length - 1] : null;
    
    if (latestData) {
        // Update AQI
        document.getElementById('aqiValue').textContent = Math.round(latestData.Nilai_AQI || 0);
        
        // Update status AQI
        const aqiStatus = document.getElementById('aqiStatus');
        const aqi = latestData.Nilai_AQI || 0;
        
        if (aqi <= 50) {
            aqiStatus.textContent = 'Baik';
            aqiStatus.className = 'stat-status good';
        } else if (aqi <= 100) {
            aqiStatus.textContent = 'Sedang';
            aqiStatus.className = 'stat-status moderate';
        } else {
            aqiStatus.textContent = 'Tidak Sehat';
            aqiStatus.className = 'stat-status unhealthy';
        }
        
        // Update Suhu
        document.getElementById('tempValue').innerHTML = `${latestData.Suhu || '-'}<span class="unit">°C</span>`;
        
        // Update Kelembapan
        document.getElementById('humidityValue').innerHTML = `${latestData.Kelembapan || '-'}<span class="unit">%</span>`;
        
        // Update sensor info
        if (sensor) {
            document.getElementById('sensorName').textContent = sensor.Nama_sensor;
            document.getElementById('sensorNameInfo').textContent = sensor.Nama_sensor;
        } else if (latestData.Nama_sensor) {
            document.getElementById('sensorName').textContent = latestData.Nama_sensor;
            document.getElementById('sensorNameInfo').textContent = latestData.Nama_sensor;
        }
        
        if (location) {
            document.getElementById('locationInfo').textContent = location.Nama_lokasi;
            document.getElementById('coordsInfo').textContent = 
                `${location.Latitude}, ${location.Longitude}`;
        } else if (latestData.Nama_lokasi) {
            document.getElementById('locationInfo').textContent = latestData.Nama_lokasi;
            document.getElementById('coordsInfo').textContent = 
                `${latestData.Latitude}, ${latestData.Longitude}`;
        }
        
        // Update waktu
        const waktu = new Date(latestData.Waktu);
        document.getElementById('lastUpdate').textContent = 
            waktu.toLocaleString('id-ID', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            });
    }
}

// Load Chart
async function loadChart() {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/sensor-data/24h', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        const data = await response.json();
        
        if (response.ok) {
            renderChart(data);
        }
    } catch (error) {
        console.error('Error loading chart:', error);
    }
}

// Render Chart
function renderChart(data) {
    const ctx = document.getElementById('aqiChart');
    if (!ctx) return;
    
    const labels = data.map(d => {
        const date = new Date(d.Waktu);
        return date.getHours() + ':00';
    });
    
    const values = data.map(d => d.Nilai_AQI);
    
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'AQI',
                data: values,
                borderColor: '#10b981',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 200
                }
            }
        }
    });
}