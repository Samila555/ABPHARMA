const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../config/database');
const { authenticate } = require('../middleware/auth');
const router = express.Router();

// POST /api/auth/login
router.post('/login', async (req, res) => {
    try {
        const { email, password, remember } = req.body;
        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Email and password are required.' });
        }
        const [rows] = await pool.execute(
            'SELECT * FROM users WHERE email = ? AND role != ?',
            [email, 'customer']
        );
        if (!rows.length) {
            return res.status(401).json({ success: false, message: 'Invalid credentials.' });
        }
        const user = rows[0];
        if (!user.is_active) {
            return res.status(401).json({ success: false, message: 'Account is disabled.' });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Invalid credentials.' });
        }
        const expiresIn = remember ? '30d' : process.env.JWT_EXPIRES_IN || '7d';
        const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn });
        await pool.execute('UPDATE users SET last_login = NOW() WHERE id = ?', [user.id]);
        // Log activity
        await pool.execute(
            'INSERT INTO activity_logs (user_id, action, module, description, ip_address) VALUES (?, ?, ?, ?, ?)',
            [user.id, 'LOGIN', 'Auth', `${user.name} logged in`, req.ip]
        );
        const { password: _, ...userData } = user;
        res.json({ success: true, message: 'Login successful', token, user: userData });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
});

// GET /api/auth/me
router.get('/me', authenticate, async (req, res) => {
    res.json({ success: true, user: req.user });
});

// POST /api/auth/logout
router.post('/logout', authenticate, async (req, res) => {
    await pool.execute(
        'INSERT INTO activity_logs (user_id, action, module, description) VALUES (?, ?, ?, ?)',
        [req.user.id, 'LOGOUT', 'Auth', `${req.user.name} logged out`]
    );
    res.json({ success: true, message: 'Logged out successfully.' });
});

// PUT /api/auth/change-password
router.put('/change-password', authenticate, async (req, res) => {
    try {
        const { current_password, new_password } = req.body;
        const [rows] = await pool.execute('SELECT password FROM users WHERE id = ?', [req.user.id]);
        const isMatch = await bcrypt.compare(current_password, rows[0].password);
        if (!isMatch) {
            return res.status(400).json({ success: false, message: 'Current password is incorrect.' });
        }
        const hashed = await bcrypt.hash(new_password, 10);
        await pool.execute('UPDATE users SET password = ? WHERE id = ?', [hashed, req.user.id]);
        res.json({ success: true, message: 'Password changed successfully.' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error.' });
    }
});

// POST /api/auth/register-admin (for initial setup)
router.post('/register', async (req, res) => {
    try {
        const { name, email, password, role = 'admin', setup_key } = req.body;
        if (setup_key !== 'ABPHARMA_SETUP_2024') {
            return res.status(403).json({ success: false, message: 'Invalid setup key.' });
        }
        const [existing] = await pool.execute('SELECT id FROM users WHERE email = ?', [email]);
        if (existing.length) {
            return res.status(409).json({ success: false, message: 'Email already exists.' });
        }
        const hashed = await bcrypt.hash(password, 10);
        const [result] = await pool.execute(
            'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
            [name, email, hashed, role]
        );
        res.status(201).json({ success: true, message: 'Admin account created.', id: result.insertId });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error.', error: error.message });
    }
});

module.exports = router;
