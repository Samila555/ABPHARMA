const express = require('express');
const { pool } = require('../config/database');
const { authenticate, authorize } = require('../middleware/auth');
const router = express.Router();

router.get('/', authenticate, async (req, res) => {
    try {
        const [rows] = await pool.execute('SELECT * FROM suppliers WHERE is_active = 1 ORDER BY name');
        res.json({ success: true, data: rows });
    } catch (error) { res.status(500).json({ success: false, message: 'Server error.' }); }
});

router.post('/', authenticate, authorize('admin'), async (req, res) => {
    try {
        const { name, contact_person, email, phone, address, city, country, payment_terms, notes } = req.body;
        const [result] = await pool.execute(
            'INSERT INTO suppliers (name, contact_person, email, phone, address, city, country, payment_terms, notes) VALUES (?,?,?,?,?,?,?,?,?)',
            [name, contact_person, email, phone, address, city, country || 'Nigeria', payment_terms, notes]
        );
        res.status(201).json({ success: true, message: 'Supplier created.', id: result.insertId });
    } catch (error) { res.status(500).json({ success: false, message: 'Server error.', error: error.message }); }
});

router.put('/:id', authenticate, authorize('admin'), async (req, res) => {
    try {
        const { name, contact_person, email, phone, address, city, country, payment_terms, notes, is_active } = req.body;
        await pool.execute(
            'UPDATE suppliers SET name=?, contact_person=?, email=?, phone=?, address=?, city=?, country=?, payment_terms=?, notes=?, is_active=? WHERE id=?',
            [name, contact_person, email, phone, address, city, country, payment_terms, notes, is_active !== false ? 1 : 0, req.params.id]
        );
        res.json({ success: true, message: 'Supplier updated.' });
    } catch (error) { res.status(500).json({ success: false, message: 'Server error.' }); }
});

router.delete('/:id', authenticate, authorize('admin'), async (req, res) => {
    try {
        await pool.execute('UPDATE suppliers SET is_active = 0 WHERE id = ?', [req.params.id]);
        res.json({ success: true, message: 'Supplier deactivated.' });
    } catch (error) { res.status(500).json({ success: false, message: 'Server error.' }); }
});

module.exports = router;
