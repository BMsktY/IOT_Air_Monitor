const express = require('express');
const router = express.Router();
const db = require('../config/database');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Token tidak ditemukan' });
    
    jwt.verify(token, process.env.JWT_SECRET || 'secret', (err, user) => {
        if (err) return res.status(403).json({ message: 'Token tidak valid' });
        req.user = user;
        next();
    });
};

const authorizeRole = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.Role)) {
            return res.status(403).json({ message: 'Akses ditolak' });
        }
        next();
    };
};

// REGISTER (Hanya role Publik)
router.post('/auth/register', async (req, res) => {
    try {
        const { Nama, Email, Password } = req.body;
        const Role = 'Publik';

        if (!Nama || !Email || !Password) {
            return res.status(400).json({ message: 'Data tidak lengkap' });
        }

        const [existing] = await db.query('SELECT * FROM users WHERE Email = ?', [Email]);
        if (existing.length > 0) {
            return res.status(400).json({ message: 'Email sudah terdaftar' });
        }

        const hashedPassword = await bcrypt.hash(Password, 10);

        const [result] = await db.query(
            'INSERT INTO users (Nama, Email, Password, Role) VALUES (?, ?, ?, ?)',
            [Nama, Email, hashedPassword, Role]
        );

        res.status(201).json({ message: 'Registrasi berhasil', userId: result.insertId });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Terjadi kesalahan server' });
    }
});

// LOGIN
router.post('/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const [users] = await db.query('SELECT * FROM users WHERE Email = ?', [email]);
        
        if (users.length === 0) {
            return res.status(401).json({ message: 'Email atau password salah' });
        }

        const user = users[0];
        const validPassword = await bcrypt.compare(password, user.Password);
        if (!validPassword) {
            return res.status(401).json({ message: 'Email atau password salah' });
        }

        const token = jwt.sign(
            { Id_user: user.Id_user, Email: user.Email, Role: user.Role },
            process.env.JWT_SECRET || 'secret',
            { expiresIn: '24h' }
        );

        res.json({
            message: 'Login berhasil',
            token,
            user: { Id_user: user.Id_user, Nama: user.Nama, Email: user.Email, Role: user.Role }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Terjadi kesalahan server' });
    }
});

// GET SENSOR DATA LATEST
router.get('/sensor-data/latest', authenticateToken, async (req, res) => {
    try {
        const [latestRows] = await db.query(`
            SELECT Id_sensor FROM sensor_data
            ORDER BY Waktu DESC LIMIT 1
        `);

        if (latestRows.length === 0) return res.json({ data: [] });

        const sensorId = latestRows[0].Id_sensor;
        const [data] = await db.query(`
            SELECT sd.*, s.Nama_sensor, s.Tipe, l.Nama_lokasi, l.Latitude, l.Longitude
            FROM sensor_data sd
            JOIN sensor s ON sd.Id_sensor = s.Id_sensor
            JOIN location l ON sd.Id_lokasi = l.Id_lokasi
            WHERE sd.Id_sensor = ?
            ORDER BY sd.Waktu DESC LIMIT 24
        `, [sensorId]);
        
        if (data.length === 0) return res.json({ data: [] });

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

        res.json({ data: reversed, sensor, location });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Terjadi kesalahan' });
    }
});

// GET SENSOR DATA 24H
router.get('/sensor-data/24h', authenticateToken, async (req, res) => {
    try {
        const [latestRows] = await db.query(`
            SELECT Id_sensor FROM sensor_data
            ORDER BY Waktu DESC LIMIT 1
        `);

        if (latestRows.length === 0) return res.json([]);

        const sensorId = latestRows[0].Id_sensor;
        const [data] = await db.query(`
            SELECT sd.*
            FROM sensor_data sd
            WHERE sd.Id_sensor = ?
            ORDER BY sd.Waktu DESC LIMIT 24
        `, [sensorId]);

        res.json(data.reverse());
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Terjadi kesalahan' });
    }
});

// GET ALL SENSORS (Admin only)
router.get('/sensors', authenticateToken, authorizeRole('Admin'), async (req, res) => {
    try {
        const [sensors] = await db.query(`
            SELECT s.*, l.Nama_lokasi as location_name
            FROM sensor s
            LEFT JOIN location l ON s.Id_lokasi = l.Id_lokasi
        `);
        res.json(sensors);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Terjadi kesalahan' });
    }
});

// GET SINGLE SENSOR BY ID (Admin only)
router.get('/sensors/:id', authenticateToken, authorizeRole('Admin'), async (req, res) => {
    try {
        const { id } = req.params;
        const [sensors] = await db.query('SELECT * FROM sensor WHERE Id_sensor = ?', [id]);
        if (sensors.length === 0) {
            return res.status(404).json({ message: 'Sensor tidak ditemukan' });
        }
        res.json(sensors[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Terjadi kesalahan' });
    }
});

// CREATE SENSOR (Admin only)
router.post('/sensors', authenticateToken, authorizeRole('Admin'), async (req, res) => {
    try {
        const { Nama_sensor, Tipe, Status, Id_lokasi } = req.body;
        
        const [result] = await db.query(
            'INSERT INTO sensor (Nama_sensor, Tipe, Status, Id_lokasi) VALUES (?, ?, ?, ?)',
            [Nama_sensor, Tipe, Status || 'Aktif', Id_lokasi]
        );
        
        res.status(201).json({
            message: 'Sensor berhasil ditambahkan',
            Id_sensor: result.insertId
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Terjadi kesalahan' });
    }
});

// UPDATE SENSOR (Admin only)
router.put('/sensors/:id', authenticateToken, authorizeRole('Admin'), async (req, res) => {
    try {
        const { id } = req.params;
        const { Nama_sensor, Tipe, Status, Id_lokasi } = req.body;
        
        await db.query(
            'UPDATE sensor SET Nama_sensor = ?, Tipe = ?, Status = ?, Id_lokasi = ? WHERE Id_sensor = ?',
            [Nama_sensor, Tipe, Status, Id_lokasi, id]
        );
        
        res.json({ message: 'Sensor berhasil diupdate' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Terjadi kesalahan' });
    }
});

router.delete('/sensors/:id', authenticateToken, authorizeRole('Admin'), async (req, res) => {
    try {
        const { id } = req.params;
        await db.query('DELETE FROM sensor WHERE Id_sensor = ?', [id]);
        res.json({ message: 'Sensor berhasil dihapus' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Terjadi kesalahan' });
    }
});

router.get('/locations', authenticateToken, async (req, res) => {
    try {
        const [locations] = await db.query('SELECT * FROM location');
        res.json(locations);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Terjadi kesalahan' });
    }
});

router.post('/report/generate', authenticateToken, authorizeRole('Analis', 'Admin'), async (req, res) => {
    try {
        const today = new Date().toISOString().split('T')[0];
        
        const [allData] = await db.query('SELECT * FROM sensor_data ORDER BY Waktu ASC');
        if (allData.length === 0) {
            return res.status(400).json({ message: 'Tidak ada data sensor untuk digenerate.' });
        }

        let dokumen_catatan = `Laporan Sensor Harian\nTanggal: ${today}\nTotal Data: ${allData.length}\n`;
        dokumen_catatan += `\nLokasi ID | Suhu | Kelembapan | AQI | Waktu\n`;
        dokumen_catatan += `---------------------------------------------------\n`;
        allData.forEach(row => {
            dokumen_catatan += `${row.Id_lokasi} | ${row.Suhu}°C | ${row.Kelembapan}% | ${row.Nilai_AQI} | ${new Date(row.Waktu).toLocaleString('id-ID')}\n`;
        });

        await db.query('DELETE FROM report WHERE Range_data = ?', [today]);

        const [averages] = await db.query(`
            SELECT Id_lokasi, AVG(Nilai_AQI) as avg_aqi 
            FROM sensor_data 
            GROUP BY Id_lokasi
        `);

        const userId = req.user.Id_user;
        
        for (const row of averages) {
            await db.query(
                'INSERT INTO report (Id_user, Id_lokasi, Range_data, Nilai_AQI_RataRata, Dokumen_Catatan) VALUES (?, ?, ?, ?, ?)',
                [userId, row.Id_lokasi, today, row.avg_aqi, dokumen_catatan]
            );
        }

        await db.query('TRUNCATE TABLE sensor_data');

        res.json({ message: 'Report berhasil di-generate! Data sensor telah dikosongkan (reset).' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Terjadi kesalahan server saat generate' });
    }
});

// GET REPORTS (Analis & Admin)
router.get('/reports', authenticateToken, authorizeRole('Analis', 'Admin'), async (req, res) => {
    try {
        const [reports] = await db.query(`
            SELECT r.*, u.Nama as nama_user, l.Nama_lokasi as nama_lokasi 
            FROM report r
            JOIN users u ON r.Id_user = u.Id_user
            JOIN location l ON r.Id_lokasi = l.Id_lokasi
            ORDER BY r.Waktu_Dibuat DESC
        `);
        res.json(reports);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Terjadi kesalahan server' });
    }
});

// GET ALL USERS (Admin only)
router.get('/users', authenticateToken, authorizeRole('Admin'), async (req, res) => {
    try {
        const [users] = await db.query('SELECT Id_user, Nama, Email, Role FROM users');
        res.json(users);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Terjadi kesalahan' });
    }
});

// CREATE USER (Admin only)
router.post('/users', authenticateToken, authorizeRole('Admin'), async (req, res) => {
    try {
        const { Nama, Email, Password, Role } = req.body;
        
        const [existing] = await db.query('SELECT * FROM users WHERE Email = ?', [Email]);
        if (existing.length > 0) return res.status(400).json({ message: 'Email sudah terdaftar' });
        
        const hashedPassword = await bcrypt.hash(Password, 10);
        
        const [result] = await db.query(
            'INSERT INTO users (Nama, Email, Password, Role) VALUES (?, ?, ?, ?)',
            [Nama, Email, hashedPassword, Role || 'Publik']
        );
        
        res.status(201).json({ message: 'Pengguna berhasil ditambahkan', Id_user: result.insertId });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Terjadi kesalahan' });
    }
});

// UPDATE USER (Admin only)
router.put('/users/:id', authenticateToken, authorizeRole('Admin'), async (req, res) => {
    try {
        const { id } = req.params;
        const { Nama, Email, Role, Password } = req.body;
        
        if (Password) {
            const hashedPassword = await bcrypt.hash(Password, 10);
            await db.query(
                'UPDATE users SET Nama = ?, Email = ?, Role = ?, Password = ? WHERE Id_user = ?',
                [Nama, Email, Role, hashedPassword, id]
            );
        } else {
            await db.query(
                'UPDATE users SET Nama = ?, Email = ?, Role = ? WHERE Id_user = ?',
                [Nama, Email, Role, id]
            );
        }
        
        res.json({ message: 'Pengguna berhasil diupdate' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Terjadi kesalahan' });
    }
});

// DELETE USER (Admin only)
router.delete('/users/:id', authenticateToken, authorizeRole('Admin'), async (req, res) => {
    try {
        const { id } = req.params;
        if (id == req.user.Id_user) {
            return res.status(400).json({ message: 'Tidak dapat menghapus akun Anda sendiri' });
        }
        await db.query('DELETE FROM users WHERE Id_user = ?', [id]);
        res.json({ message: 'Pengguna berhasil dihapus' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Terjadi kesalahan' });
    }
});

module.exports = router;