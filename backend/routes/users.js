const express = require('express');
const { pool } = require('../config/database');
const { authenticate, authorize } = require('../middleware/auth');
const router = express.Router();

router.get('/', authenticate, authorize('admin'), async (req, res) => {
    try {
        const [rows] = await pool.execute('SELECT id, name, email, role, is_active, last_login, created_at FROM users ORDER BY created_at DESC');
        res.json({ success: true, data: rows });
    } catch (error) { res.status(500).json({ success: false, message: 'Server error.' }); }
});

router.post('/', authenticate, authorize('admin'), async (req, res) => {
    try {
        const bcrypt = require('bcryptjs');
        const { name, email, password, role, phone } = req.body;
        const [existing] = await pool.execute('SELECT id FROM users WHERE email = ?', [email]);
        if (existing.length) return res.status(409).json({ success: false, message: 'Email already exists.' });
        const hashed = await bcrypt.hash(password, 10);
        const [result] = await pool.execute(
            'INSERT INTO users (name, email, password, role, phone) VALUES (?,?,?,?,?)',
            [name, email, hashed, role || 'pharmacist', phone]
        );
        res.status(201).json({ success: true, message: 'User created.', id: result.insertId });
    } catch (error) { res.status(500).json({ success: false, message: 'Server error.', error: error.message }); }
});

router.put('/:id', authenticate, authorize('admin'), async (req, res) => {
    try {
        const { name, email, role, phone, is_active } = req.body;
        await pool.execute('UPDATE users SET name=?, email=?, role=?, phone=?, is_active=? WHERE id=?',
            [name, email, role, phone, is_active !== false ? 1 : 0, req.params.id]);
        res.json({ success: true, message: 'User updated.' });
    } catch (error) { res.status(500).json({ success: false, message: 'Server error.' }); }
});

router.get('/logs', authenticate, authorize('admin'), async (req, res) => {
    try {
        const { page = 1, limit = 50 } = req.query;
        const [rows] = await pool.execute(
            `SELECT al.*, u.name as user_name FROM activity_logs al LEFT JOIN users u ON al.user_id = u.id ORDER BY al.created_at DESC LIMIT ? OFFSET ?`,
            [parseInt(limit), (parseInt(page) - 1) * parseInt(limit)]
        );
        res.json({ success: true, data: rows });
    } catch (error) { res.status(500).json({ success: false, message: 'Server error.' }); }
});

module.exports = router;
