const express = require('express');
const cors = require('cors');
const http = require('http');
const socketIO = require('socket.io');
const path = require('path');
const net = require('net');
require('dotenv').config();
const errorHandler = require('./src/middleware/errorHandler');
const compression = require('compression');

const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
    cors: { origin: "*", methods: ["GET", "POST"], credentials: true },
    pingTimeout: 60000,
    pingInterval: 25000
});

// PENTING: global.io didefinisikan SEBELUM routes & MQTT dimuat
global.io = io;

// PORT & HOST untuk demo lokal yang stabil
function getPort() {
    return Number(process.env.PORT || 3000);
}

function getHost() {
    return process.env.HOST || '127.0.0.1';
}

function findAvailablePort(startPort = getPort()) {
    return new Promise((resolve) => {
        const tester = net.createServer();
        tester.listen(startPort, () => {
            const port = tester.address().port;
            tester.close(() => resolve(port));
        });
        tester.on('error', () => resolve(findAvailablePort(startPort + 1)));
    });
}

// Middleware
app.use(compression());
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'Public')));

// Routes API
app.use('/api', require('./src/routes/api'));
app.use('/api/auth', require('./src/routes/forgotPassword'));

// ROUTING HTML (Path Absolut & Konsisten)
const htmlDir = path.join(__dirname, 'Public', 'html');
app.get('/', (req, res) => res.sendFile(path.join(htmlDir, 'login.html')));
app.get('/login', (req, res) => res.sendFile(path.join(htmlDir, 'login.html')));
app.get('/register', (req, res) => res.sendFile(path.join(htmlDir, 'register.html')));
app.get('/forgot-password', (req, res) => res.sendFile(path.join(htmlDir, 'forgot-password.html')));
app.get('/dashboard', (req, res) => res.sendFile(path.join(htmlDir, 'index.html')));
app.get('/admin', (req, res) => res.sendFile(path.join(htmlDir, 'admin.html')));
app.get('/analis', (req, res) => res.sendFile(path.join(htmlDir, 'analis.html')));
app.get('/pengguna', (req, res) => res.sendFile(path.join(htmlDir, 'pengguna.html')));

// Middleware Error Handling Tersentralisasi (Harus ditaruh setelah semua route)
app.use(errorHandler);

// WebSocket Handler
io.on('connection', (socket) => {
    console.log(`🔌 Client connected: ${socket.id}`);
    sendLatestData(socket);
    socket.on('disconnect', () => console.log(`🔌 Client disconnected: ${socket.id}`));
});

async function sendLatestData(socket) {
    try {
        const db = require('./src/config/database');
        const [latestRows] = await db.query(`
            SELECT Id_sensor FROM sensor_data
            ORDER BY Waktu DESC LIMIT 1
        `);

        if (latestRows.length === 0) {
            socket.emit('initialData', { data: [], sensor: null, location: null });
            return;
        }

        const sensorId = latestRows[0].Id_sensor;
        const [data] = await db.query(`
            SELECT sd.*, s.Nama_sensor, s.Tipe, l.Nama_lokasi, l.Latitude, l.Longitude
            FROM sensor_data sd
            JOIN sensor s ON sd.Id_sensor = s.Id_sensor
            JOIN location l ON sd.Id_lokasi = l.Id_lokasi
            WHERE sd.Id_sensor = ?
            ORDER BY sd.Waktu DESC LIMIT 24
        `, [sensorId]);

        if (data.length > 0) {
            const reversed = data.reverse();
            const sensor = {
                Id_sensor: reversed[reversed.length - 1].Id_sensor,
                Nama_sensor: reversed[reversed.length - 1].Nama_sensor,
                Tipe: reversed[reversed.length - 1].Tipe
            };
            const location = {
                Id_lokasi: reversed[reversed.length - 1].Id_lokasi,
                Nama_lokasi: reversed[reversed.length - 1].Nama_lokasi,
                Latitude: reversed[reversed.length - 1].Latitude,
                Longitude: reversed[reversed.length - 1].Longitude
            };
            socket.emit('initialData', { data: reversed, sensor, location });
        } else {
            socket.emit('initialData', { data: [], sensor: null, location: null });
        }
    } catch (error) {
        console.error('Error sending initial data:', error.message);
        socket.emit('initialData', { data: [], sensor: null, location: null });
    }
}

async function verifyDatabaseConnection() {
    const db = require('./src/config/database');
    try {
        await db.testConnection();
        console.log('MySQL terhubung dengan baik.');
        return true;
    } catch (error) {
        console.error('MySQL gagal terhubung:', error.message);
        console.error('Pastikan MySQL berjalan dan konfigurasi .env (DB_HOST, DB_USER, DB_PASSWORD, DB_NAME) benar.');
        return false;
    }
}

async function startServer() {
    try {
        const dbOk = await verifyDatabaseConnection();
        if (!dbOk) {
            console.error('Server tidak dimulai karena koneksi database gagal.');
            process.exit(1);
        }

        const PORT = await findAvailablePort(getPort());
        const HOST = getHost();
        const localUrl = `http://localhost:${PORT}`;

        server.on('error', (err) => {
            if (err.code === 'EADDRINUSE') {
                console.error(`\n❌ Port ${PORT} sedang digunakan. Tutup proses lain atau gunakan PORT yang berbeda.`);
                process.exit(1);
            } else {
                console.error('Server error:', err.message);
            }
        });

        server.listen(PORT, HOST, async () => {
            console.log(`\nServer berjalan di.`);
            console.log(`Local URL      : ${localUrl}`);

            try {
                const { connectMQTT } = require('./src/mqtt/mqttClient');
                connectMQTT();
            } catch (error) {
                console.log('MQTT client gagal dimuat:', error.message);
            }
        });
    } catch (error) {
        console.error('Error starting server:', error.message);
    }
}

// Jalankan server
startServer();