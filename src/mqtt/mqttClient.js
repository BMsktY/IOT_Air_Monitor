const mqtt = require('mqtt');
const db = require('../config/database');

const MQTT_BROKER = process.env.MQTT_BROKER || 'mqtt://broker.mqttdashboard.com:1883';
const MQTT_TOPIC = process.env.MQTT_TOPIC || 'monitoring-udara';
const MQTT_CLIENT_ID = `dashboard-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;

let mqttClient = null;
let reconnectCount = 0;
const MAX_RECONNECT = 10;

function connectMQTT() {
    console.log('\n' + '═'.repeat(50));
    console.log('MQTT CLIENT STARTING');
    console.log('Broker:', MQTT_BROKER);
    console.log('Topic :', MQTT_TOPIC);
    console.log('═'.repeat(50) + '\n');

    mqttClient = mqtt.connect(MQTT_BROKER, {
        clientId: MQTT_CLIENT_ID,
        clean: true,
        keepalive: 30,
        reconnectPeriod: 3000,
        connectTimeout: 15000,
        rejectUnauthorized: false
    });

    mqttClient.on('connect', () => {
        console.log('[MQTT] Connected to broker');
        reconnectCount = 0;
        mqttClient.subscribe(MQTT_TOPIC, { qos: 0 }, (err) => {
            if (err) console.error('[MQTT] Subscribe failed:', err.message);
            else console.log('[MQTT] Listening on topic:', MQTT_TOPIC, '\n');
        });
    });

    mqttClient.on('message', async (topic, message) => {
        try {
            const raw = message.toString();
            const data = JSON.parse(raw);

            // PERBAIKAN: Gunakan undefined check agar nilai 0 tidak ditolak
            if (data.temperature === undefined || data.humidity === undefined || data.aqi === undefined) {
                console.warn('[MQTT] Data tidak lengkap. Ditolak.\n');
                return;
            }

            // Tentukan status AQI untuk Node.js terminal
            let aqiStatus = "Berbahaya";
            if (data.aqi <= 50) aqiStatus = "Baik / Good";
            else if (data.aqi <= 100) aqiStatus = "Sedang / Moderate";
            else if (data.aqi <= 150) aqiStatus = "Tidak Sehat";
            else if (data.aqi <= 200) aqiStatus = "Tidak Sehat";
            else if (data.aqi <= 300) aqiStatus = "Sangat Tidak Sehat";

            // 📟 TAMPILKAN DI TERMINAL NODE.JS
            console.log('------------------------------------------------');
            console.log('DATA MASUK DARI WOKWI SIMULATOR');
            console.log('Suhu      :', data.temperature, '°C');
            console.log('Kelembapan:', data.humidity, '%');
            console.log('AQI       :', data.aqi, `(${aqiStatus})`);
            console.log('Timestamp :', new Date().toLocaleString('id-ID'));
            console.log('-----------------------------------------------\n');

            // Emit ke WebSocket
            const io = global.io;
            if (io) {
                io.emit('sensorDataUpdate', {
                    temperature: parseFloat(data.temperature),
                    humidity: parseFloat(data.humidity),
                    aqi: parseFloat(data.aqi),
                    timestamp: new Date(),
                    source: 'wokwi'
                });
            }

            // Simpan ke DB (non-blocking)
            saveSensorData(data).catch(err => console.error('[DB] Save failed:', err.message));

        } catch (error) {
            console.error('[MQTT] Parse error:', error.message);
        }
    });

    mqttClient.on('error', (err) => console.error('[MQTT] Error:', err.message));
    mqttClient.on('reconnect', () => {
        reconnectCount++;
        console.log(`🔄 [MQTT] Reconnecting... (${reconnectCount}/${MAX_RECONNECT})`);
        if (reconnectCount >= MAX_RECONNECT) console.error('[MQTT] Max reconnections reached.');
    });
    mqttClient.on('close', () => console.log('[MQTT] Connection closed'));
}

async function saveSensorData(data) {
    try {
        const [loc] = await db.query("SELECT Id_lokasi FROM location WHERE Nama_lokasi LIKE '%Kantin%' LIMIT 1");
        if (loc.length === 0) throw new Error("Lokasi Kantin tidak ditemukan di DB");
        
        const locId = loc[0].Id_lokasi;
        const sensorId = 11;

        await db.query(`
            INSERT IGNORE INTO sensor (Id_sensor, Nama_sensor, Tipe, Status, Id_lokasi)
            VALUES (?, 'Sensor Kantin', 'DHT22+MQ135', 'Aktif', ?)
        `, [sensorId, locId]);

        await db.query(`
            INSERT INTO sensor_data (Id_sensor, Id_lokasi, Suhu, Kelembapan, Nilai_AQI, Waktu)
            VALUES (?, ?, ?, ?, ?, NOW())
        `, [sensorId, locId, parseFloat(data.temperature), parseFloat(data.humidity), parseFloat(data.aqi)]);

        console.log('[DB] Data berhasil disimpan ke MySQL\n');
    } catch (error) {
        console.error('[DB] Error:', error.message);
    }
}

module.exports = { connectMQTT, getMqttClient: () => mqttClient };