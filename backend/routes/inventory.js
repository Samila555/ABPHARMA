const express = require('express');
const { pool } = require('../config/database');
const { authenticate, authorize } = require('../middleware/auth');
const router = express.Router();

router.get('/', authenticate, async (req, res) => {
    try {
        const { medicine_id, transaction_type, from_date, to_date, page = 1, limit = 30 } = req.query;
        let query = `SELECT it.*, m.name as medicine_name FROM inventory_transactions it LEFT JOIN medicines m ON it.medicine_id = m.id WHERE 1=1`;
        const params = [];
        if (medicine_id) { query += ' AND it.medicine_id = ?'; params.push(medicine_id); }
        if (transaction_type) { query += ' AND it.transaction_type = ?'; params.push(transaction_type); }
        if (from_date) { query += ' AND DATE(it.created_at) >= ?'; params.push(from_date); }
        if (to_date) { query += ' AND DATE(it.created_at) <= ?'; params.push(to_date); }
        const countQuery = query.replace('SELECT it.*, m.name as medicine_name', 'SELECT COUNT(*) as total');
        const [countRows] = await pool.execute(countQuery, params);
        const total = countRows[0].total;
        query += ' ORDER BY it.created_at DESC LIMIT ? OFFSET ?';
        params.push(parseInt(limit), (parseInt(page) - 1) * parseInt(limit));
        const [rows] = await pool.execute(query, params);
        res.json({ success: true, data: rows, total, page: parseInt(page), pages: Math.ceil(total / limit) });
    } catch (error) { res.status(500).json({ success: false, message: 'Server error.' }); }
});

// POST /api/inventory/adjust - Manual adjustment
router.post('/adjust', authenticate, authorize('admin', 'pharmacist'), async (req, res) => {
    const conn = await pool.getConnection();
    await conn.beginTransaction();
    try {
        const { medicine_id, transaction_type, quantity, reason, batch_number, expiry_date } = req.body;
        const [meds] = await conn.execute('SELECT quantity FROM medicines WHERE id = ?', [medicine_id]);
        if (!meds.length) { await conn.rollback(); return res.status(404).json({ success: false, message: 'Medicine not found.' }); }
        const before = meds[0].quantity;
        let after;
        if (['stock_in', 'return'].includes(transaction_type)) { after = before + parseInt(quantity); }
        else { after = Math.max(0, before - parseInt(quantity)); }
        await conn.execute('UPDATE medicines SET quantity = ? WHERE id = ?', [after, medicine_id]);
        await conn.execute(
            'INSERT INTO inventory_transactions (medicine_id, transaction_type, quantity, balance_before, balance_after, reason, batch_number, expiry_date, created_by) VALUES (?,?,?,?,?,?,?,?,?)',
            [medicine_id, transaction_type, quantity, before, after, reason, batch_number, expiry_date || null, req.user.id]
        );
        await conn.commit();
        res.json({ success: true, message: 'Stock adjusted.', balance: after });
    } catch (error) {
        await conn.rollback();
        res.status(500).json({ success: false, message: 'Server error.' });
    } finally { conn.release(); }
});

// GET /api/inventory/low-stock
router.get('/low-stock', authenticate, async (req, res) => {
    try {
        const [rows] = await pool.execute('SELECT * FROM medicines WHERE quantity <= min_stock_level AND is_active = 1 ORDER BY quantity ASC');
        res.json({ success: true, data: rows });
    } catch (error) { res.status(500).json({ success: false, message: 'Server error.' }); }
});

// GET /api/inventory/expired
router.get('/expired', authenticate, async (req, res) => {
    try {
        const [rows] = await pool.execute('SELECT * FROM medicines WHERE expiry_date < CURDATE() AND is_active = 1 ORDER BY expiry_date ASC');
        res.json({ success: true, data: rows });
    } catch (error) { res.status(500).json({ success: false, message: 'Server error.' }); }
});

// GET /api/inventory/expiring-soon
router.get('/expiring-soon', authenticate, async (req, res) => {
    try {
        const { days = 30 } = req.query;
        const [rows] = await pool.execute(
            'SELECT * FROM medicines WHERE expiry_date BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL ? DAY) AND is_active = 1 ORDER BY expiry_date ASC',
            [parseInt(days)]
        );
        res.json({ success: true, data: rows });
    } catch (error) { res.status(500).json({ success: false, message: 'Server error.' }); }
});

module.exports = router;
