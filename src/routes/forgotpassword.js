const express = require('express');
const router = express.Router();
const db = require('../config/database');
const bcrypt = require('bcrypt');

const validate = require('../middleware/validate');
const schemas = require('../middleware/validators');

// FORGOT PASSWORD - Langsung update password tanpa token/auth
// Cukup masukkan email dan password baru
router.post('/forgot-password', validate(schemas.forgotPassword), async (req, res, next) => {
    try {
        const { email, newPassword } = req.body;
        
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
        next(error);
    }
});

// Endpoint untuk admin reset password user lain (optional)
router.post('/admin/reset-password', validate(schemas.adminResetPassword), async (req, res, next) => {
    try {
        const { targetEmail, newPassword } = req.body;
        
        const hashedPassword = await bcrypt.hash(newPassword, 10);

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
        next(error);
    }
});

module.exports = router;