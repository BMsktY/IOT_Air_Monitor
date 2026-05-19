require('dotenv').config();
const mysql = require('mysql2/promise');

async function runMigration() {
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'monitoring_udara'
        });

        console.log('Connected to DB');

        // Check if column exists
        const [rows] = await connection.query(`SHOW COLUMNS FROM report LIKE 'Dokumen_Catatan'`);
        if (rows.length === 0) {
            await connection.query('ALTER TABLE report ADD COLUMN Dokumen_Catatan TEXT');
            console.log('Column Dokumen_Catatan added to report table.');
        } else {
            console.log('Column already exists.');
        }

        await connection.end();
    } catch (err) {
        console.error('Migration failed:', err);
    }
}

runMigration();
