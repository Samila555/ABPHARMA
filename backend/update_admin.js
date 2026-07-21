const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function updateAdmin() {
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST || '127.0.0.1',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'abpharma_db'
        });

        const newEmail = 'director@abpharma.com';
        const newPassword = 'SecureAdmin77!';
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        // Delete any existing admins to make sure it's clean
        await connection.execute('DELETE FROM users WHERE role = "admin"');

        // Insert new admin
        await connection.execute(
            'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
            ['AB Pharma Director', newEmail, hashedPassword, 'admin']
        );

        console.log('✅ Admin credentials completely remade.');
        console.log('   New Email: ' + newEmail);
        console.log('   New Password: ' + newPassword);

        await connection.end();
        process.exit(0);
    } catch (err) {
        console.error('❌ Failed to update admin:', err);
        process.exit(1);
    }
}

updateAdmin();
