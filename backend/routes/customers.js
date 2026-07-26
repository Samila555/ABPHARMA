const express = require('express');
const { pool } = require('../config/database');
const { authenticate, authorize } = require('../middleware/auth');
const router = express.Router();

router.get('/', authenticate, async (req, res) => {
    try {
        const { search, page = 1, limit = 20 } = req.query;
        let query = 'SELECT * FROM customers WHERE is_active = 1';
        const params = [];
        if (search) { query += ' AND (name LIKE ? OR email LIKE ? OR phone LIKE ?)'; params.push(`%${search}%`, `%${search}%`, `%${search}%`); }
        const [countRows] = await pool.query(query.replace('SELECT *', 'SELECT COUNT(*) as total'), params);
        const total = countRows[0].total;
        query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
        const limitNum = parseInt(limit) || 20;
        const offsetNum = (parseInt(page) - 1) * limitNum;
        const [rows] = await pool.query(query, [...params, limitNum, offsetNum]);
        res.json({ success: true, data: rows, total, page: parseInt(page), pages: Math.ceil(total / limitNum) });
    } catch (error) { res.status(500).json({ success: false, message: 'Server error.' }); }
});

router.get('/:id', authenticate, async (req, res) => {
    try {
        const [rows] = await pool.execute('SELECT * FROM customers WHERE id = ?', [req.params.id]);
        if (!rows.length) return res.status(404).json({ success: false, message: 'Customer not found.' });
        const [orders] = await pool.execute('SELECT * FROM orders WHERE customer_id = ? ORDER BY created_at DESC LIMIT 20', [req.params.id]);
        res.json({ success: true, data: { ...rows[0], orders } });
    } catch (error) { res.status(500).json({ success: false, message: 'Server error.' }); }
});

router.post('/', authenticate, async (req, res) => {
    try {
        const { name, email, phone, date_of_birth, gender, address, city, membership_type, notes } = req.body;
        const [result] = await pool.execute(
            'INSERT INTO customers (name, email, phone, date_of_birth, gender, address, city, membership_type, notes) VALUES (?,?,?,?,?,?,?,?,?)',
            [name, email, phone, date_of_birth || null, gender, address, city, membership_type || 'regular', notes]
        );
        res.status(201).json({ success: true, message: 'Customer created.', id: result.insertId });
    } catch (error) { res.status(500).json({ success: false, message: 'Server error.', error: error.message }); }
});

router.put('/:id', authenticate, async (req, res) => {
    try {
        const { name, email, phone, date_of_birth, gender, address, city, membership_type, notes, is_active } = req.body;
        await pool.execute(
            'UPDATE customers SET name=?, email=?, phone=?, date_of_birth=?, gender=?, address=?, city=?, membership_type=?, notes=?, is_active=? WHERE id=?',
            [name, email, phone, date_of_birth || null, gender, address, city, membership_type || 'regular', notes, is_active !== false ? 1 : 0, req.params.id]
        );
        res.json({ success: true, message: 'Customer updated.' });
    } catch (error) { res.status(500).json({ success: false, message: 'Server error.' }); }
});

router.delete('/:id', authenticate, authorize('admin'), async (req, res) => {
    try {
        await pool.execute('UPDATE customers SET is_active = 0 WHERE id = ?', [req.params.id]);
        res.json({ success: true, message: 'Customer deactivated.' });
    } catch (error) { res.status(500).json({ success: false, message: 'Server error.' }); }
});

module.exports = router;
