const { pool } = require('./config/database');
const bcrypt = require('bcryptjs');

async function updateAdmin() {
    try {
        const connection = await pool.getConnection();

        const newEmail = 'abel@gmail.com';
        const newPassword = 'abel123@';
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        // Delete any existing admins to make sure it's clean
        await connection.execute('DELETE FROM users WHERE role = "admin"');

        // Insert new admin
        await connection.execute(
            'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
            ['Abel', newEmail, hashedPassword, 'admin']
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
