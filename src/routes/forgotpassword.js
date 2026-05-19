const express = require('express');
const router = express.Router();
const db = require('../config/database');
const bcrypt = require('bcrypt');

// FORGOT PASSWORD - Langsung update password tanpa token/auth
// Cukup masukkan email dan password baru
router.post('/forgot-password', async (req, res) => {
    try {
        const { email, newPassword } = req.body;
        
        // Validasi input
        if (!email || !newPassword) {
            return res.status(400).json({ 
                message: 'Email dan password baru diperlukan' 
            });
        }
        
        if (newPassword.length < 6) {
            return res.status(400).json({ 
                message: 'Password minimal 6 karakter' 
            });
        }
        
        // Cek apakah email terdaftar
        const [users] = await db.query(
            'SELECT * FROM users WHERE Email = ?', 
            [email]
        );
        
        if (users.length === 0) {
            return res.status(404).json({ 
                message: 'Email tidak terdaftar' 
            });
        }
        
        const user = users[0];
        
        // Hash password baru
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        
        // Langsung update password di database
        await db.query(
            'UPDATE users SET Password = ? WHERE Email = ?',
            [hashedPassword, email]
        );
        
        console.log('=== PASSWORD UPDATED ===');
        console.log('Email:', email);
        console.log('User:', user.Nama);
        console.log('Role:', user.Role);
        console.log('========================');
        
        res.json({ 
            message: 'Password berhasil diubah. Silakan login dengan password baru.',
            email: email
        });
        
    } catch (error) {
        console.error('Error forgot password:', error);
        res.status(500).json({ 
            message: 'Terjadi kesalahan server' 
        });
    }
});

// Endpoint untuk admin reset password user lain (optional)
router.post('/admin/reset-password', async (req, res) => {
    try {
        const { targetEmail, newPassword } = req.body;
        
        if (!targetEmail || !newPassword) {
            return res.status(400).json({ 
                message: 'Email target dan password baru diperlukan' 
            });
        }
        
        if (newPassword.length < 6) {
            return res.status(400).json({ 
                message: 'Password minimal 6 karakter' 
            });
        }
        
        // Hash password
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        
        // Update password
        const [result] = await db.query(
            'UPDATE users SET Password = ? WHERE Email = ?',
            [hashedPassword, targetEmail]
        );
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ 
                message: 'User tidak ditemukan' 
            });
        }
        
        res.json({ 
            message: 'Password user berhasil direset' 
        });
        
    } catch (error) {
        console.error('Error admin reset password:', error);
        res.status(500).json({ 
            message: 'Terjadi kesalahan server' 
        });
    }
});

module.exports = router;