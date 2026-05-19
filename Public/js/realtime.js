let socket = null;
let aqiChart = null;

function initRealTimeConnection() {
    console.log('Connecting to WebSocket...');
    
    socket = io({
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionDelay: 1000
    });
    
    socket.on('connect', () => {
        console.log('WebSocket connected');
        updateConnectionStatus('connected');
    });
    
    socket.on('disconnect', () => {
        console.log('WebSocket disconnected');
        updateConnectionStatus('disconnected');
    });
    
    socket.on('initialData', (payload) => {
        console.log('Initial data:', payload.data ? payload.data.length : 0, 'points');
        
        if (payload.data && payload.data.length > 0) {
            updateDashboardUI(payload.data);
            initChart(payload.data);
        } else {
            document.getElementById('aqiValue').textContent = '--';
            document.getElementById('tempValue').innerHTML = '--<span class="unit">°C</span>';
            document.getElementById('humidityValue').innerHTML = '--<span class="unit">%</span>';
            document.getElementById('aqiStatus').textContent = 'Menunggu data sensor...';
        }
        
        if (payload.sensor) {
            document.getElementById('sensorName').textContent = payload.sensor.Nama_sensor;
            document.getElementById('sensorNameInfo').textContent = payload.sensor.Nama_sensor;
        }
        if (payload.location) {
            document.getElementById('locationInfo').textContent = payload.location.Nama_lokasi;
        }
    });
    
    socket.on('sensorDataUpdate', (data) => {
        console.log('REALTIME UPDATE:', data);
        updateRealtimeDisplay(data);
        updateChart(data);
        showNotification('Data diperbarui!', 'success');
        resetLiveTimeout();
    });
    
    socket.on('connect_error', (err) => {
        console.error('WebSocket error:', err.message);
        updateConnectionStatus('error');
    });
}

let liveTimeout;

function updateConnectionStatus(status) {
    const badge = document.getElementById('connectionStatus');
    if (!badge) return;
    
    if (status === 'connected') {
        badge.textContent = '● Live';
        badge.style.background = '#d1fae5';
        badge.style.color = '#059669';
    } else {
        badge.textContent = '● Bukan Live';
        badge.style.background = '#fee2e2';
        badge.style.color = '#dc2626';
    }
}

function resetLiveTimeout() {
    clearTimeout(liveTimeout);
    updateConnectionStatus('connected');
    
    // Jika 15 detik tidak ada update data, anggap mati/offline
    liveTimeout = setTimeout(() => {
        updateConnectionStatus('offline');
    }, 15000);
}

function updateRealtimeDisplay(data) {
    const aqiEl = document.getElementById('aqiValue');
    if (aqiEl && data.aqi !== undefined) aqiEl.textContent = Math.round(data.aqi);
    
    const statusEl = document.getElementById('aqiStatus');
    if (statusEl && data.aqi !== undefined) {
        if (data.aqi <= 50) {
            statusEl.textContent = 'Baik';
            statusEl.className = 'stat-status good';
        } else if (data.aqi <= 100) {
            statusEl.textContent = 'Sedang';
            statusEl.className = 'stat-status moderate';
        } else {
            statusEl.textContent = 'Tidak Sehat';
            statusEl.className = 'stat-status unhealthy';
        }
    }
    
    const tempEl = document.getElementById('tempValue');
    if (tempEl && data.temperature !== undefined) tempEl.innerHTML = parseFloat(data.temperature).toFixed(1) + '<span class="unit">°C</span>';
    
    const humEl = document.getElementById('humidityValue');
    if (humEl && data.humidity !== undefined) humEl.innerHTML = parseFloat(data.humidity).toFixed(1) + '<span class="unit">%</span>';
    
    const timeEl = document.getElementById('lastUpdate');
    if (timeEl) timeEl.textContent = new Date().toLocaleString('id-ID');
}

function updateDashboardUI(data) {
    if (!data || data.length === 0) return;
    const latest = data[data.length - 1];
    updateRealtimeDisplay({
        aqi: latest.Nilai_AQI,
        temperature: latest.Suhu,
        humidity: latest.Kelembapan
    });
}

function initChart(data) {
    const ctx = document.getElementById('aqiChart');
    if (!ctx) return;
    
    if (aqiChart && typeof aqiChart.destroy === 'function') {
        aqiChart.destroy();
    }
    
    const latest10 = data.slice(-10);
    const labels = latest10.map(d => {
        const dt = new Date(d.Waktu);
        return dt.getHours() + ':' + dt.getMinutes().toString().padStart(2, '0');
    });
    const values = latest10.map(d => d.Nilai_AQI);
    
    aqiChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'AQI',
                data: values,
                borderColor: '#10b981',
                backgroundColor: 'rgba(16,185,129,0.1)',
                tension: 0.4,
                fill: true,
                pointRadius: 2,
                pointHoverRadius: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: { legend: { display: false } },
            scales: {
                y: { beginAtZero: true, max: 200 },
                x: { title: { display: true, text: 'Waktu' } }
            }
        }
    });
}

function updateChart(newData) {
    if (!aqiChart || typeof aqiChart.update !== 'function') return;
    
    const now = new Date();
    const label = now.getHours() + ':' + now.getMinutes().toString().padStart(2, '0');
    
    aqiChart.data.labels.push(label);
    aqiChart.data.datasets[0].data.push(newData.aqi);
    
    if (aqiChart.data.labels.length > 10) {
        aqiChart.data.labels.shift();
        aqiChart.data.datasets[0].data.shift();
    }
    
    aqiChart.update('none');
}

function showNotification(msg, type) {
    type = type || 'info';
    const el = document.createElement('div');
    el.textContent = msg;
    el.style.cssText = 'position:fixed;top:20px;right:20px;padding:1rem 2rem;background:' + 
        (type==='success'?'#10b981':'#3b82f6') + ';color:white;border-radius:8px;z-index:9999;';
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 2000);
}

document.addEventListener('DOMContentLoaded', () => {
    console.log('📄 Dashboard loaded');
    
    // Periksa autentikasi dan update UI
    if (typeof checkAuth === 'function') {
        const currentUser = checkAuth();
        if (currentUser && currentUser.Nama) {
            const userInfo = document.getElementById('userInfo');
            if (userInfo) {
                const span = userInfo.querySelector('span');
                if (span) span.textContent = currentUser.Nama;
            }
            
            // Show admin menu if applicable
            const adminMenu = document.getElementById('adminMenu');
            if (adminMenu && currentUser.Role === 'Admin') {
                adminMenu.style.display = 'flex';
            }
        }
    }
    
    initRealTimeConnection();
});