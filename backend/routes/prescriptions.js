const express = require('express');
const { pool } = require('../config/database');
const { authenticate, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');
const router = express.Router();

router.get('/', authenticate, async (req, res) => {
    try {
        const { status, page = 1, limit = 20 } = req.query;
        let query = `SELECT p.*, c.name as customer_name FROM prescriptions p LEFT JOIN customers c ON p.customer_id = c.id WHERE 1=1`;
        const params = [];
        if (status) { query += ' AND p.status = ?'; params.push(status); }
        const [countRows] = await pool.execute(query.replace('SELECT p.*, c.name as customer_name', 'SELECT COUNT(*) as total'), params);
        const total = countRows[0].total;
        query += ' ORDER BY p.created_at DESC LIMIT ? OFFSET ?';
        params.push(parseInt(limit), (parseInt(page) - 1) * parseInt(limit));
        const [rows] = await pool.execute(query, params);
        res.json({ success: true, data: rows, total, pages: Math.ceil(total / limit) });
    } catch (error) { res.status(500).json({ success: false, message: 'Server error.' }); }
});

router.post('/', authenticate, upload('prescriptions').single('image'), async (req, res) => {
    try {
        const { customer_id, doctor_name, doctor_phone, hospital, prescription_date, notes } = req.body;
        const image = req.file ? `/uploads/prescriptions/${req.file.filename}` : null;
        const [result] = await pool.execute(
            'INSERT INTO prescriptions (customer_id, doctor_name, doctor_phone, hospital, prescription_date, image, notes) VALUES (?,?,?,?,?,?,?)',
            [customer_id || null, doctor_name, doctor_phone, hospital, prescription_date || null, image, notes]
        );
        res.status(201).json({ success: true, message: 'Prescription submitted.', id: result.insertId });
    } catch (error) { res.status(500).json({ success: false, message: 'Server error.' }); }
});

router.patch('/:id/status', authenticate, authorize('admin', 'pharmacist'), async (req, res) => {
    try {
        const { status } = req.body;
        await pool.execute('UPDATE prescriptions SET status=?, verified_by=?, verified_at=NOW() WHERE id=?',
            [status, req.user.id, req.params.id]);
        res.json({ success: true, message: 'Prescription status updated.' });
    } catch (error) { res.status(500).json({ success: false, message: 'Server error.' }); }
});

module.exports = router;
