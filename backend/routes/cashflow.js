const express = require('express');
const { pool } = require('../config/database');
const { authenticate } = require('../middleware/auth');
const router = express.Router();

// GET /api/cashflow
router.get('/', authenticate, async (req, res) => {
    try {
        const { type, from_date, to_date, page = 1, limit = 30 } = req.query;
        let query = 'SELECT cf.*, u.name as created_by_name FROM cash_flow cf LEFT JOIN users u ON cf.created_by = u.id WHERE 1=1';
        const params = [];
        if (type) { query += ' AND cf.type = ?'; params.push(type); }
        if (from_date) { query += ' AND cf.date >= ?'; params.push(from_date); }
        if (to_date) { query += ' AND cf.date <= ?'; params.push(to_date); }
        const [countRows] = await pool.execute(query.replace('SELECT cf.*, u.name as created_by_name', 'SELECT COUNT(*) as total'), params);
        const total = countRows[0].total;
        query += ' ORDER BY cf.date DESC, cf.created_at DESC LIMIT ? OFFSET ?';
        params.push(parseInt(limit), (parseInt(page) - 1) * parseInt(limit));
        const [rows] = await pool.execute(query, params);
        res.json({ success: true, data: rows, total, page: parseInt(page), pages: Math.ceil(total / limit) });
    } catch (error) { res.status(500).json({ success: false, message: 'Server error.' }); }
});

// GET /api/cashflow/summary
router.get('/summary', authenticate, async (req, res) => {
    try {
        const { month, year } = req.query;
        const today = new Date();
        const m = month || String(today.getMonth() + 1).padStart(2, '0');
        const y = year || today.getFullYear();
        const period = `${y}-${m}`;
        const [rows] = await pool.execute(`
      SELECT type, COALESCE(SUM(amount), 0) as total FROM cash_flow
      WHERE DATE_FORMAT(date, '%Y-%m') = ? GROUP BY type`, [period]);
        const income = rows.find(r => r.type === 'income')?.total || 0;
        const expenses = rows.find(r => r.type === 'expense')?.total || 0;
        res.json({ success: true, data: { income, expenses, profit: income - expenses, period } });
    } catch (error) { res.status(500).json({ success: false, message: 'Server error.' }); }
});

// POST /api/cashflow
router.post('/', authenticate, async (req, res) => {
    try {
        const { type, category, description, amount, payment_method, date } = req.body;
        const [result] = await pool.execute(
            'INSERT INTO cash_flow (type, category, description, amount, payment_method, date, created_by) VALUES (?,?,?,?,?,?,?)',
            [type, category, description, amount, payment_method || 'cash', date || new Date().toISOString().split('T')[0], req.user.id]
        );
        res.status(201).json({ success: true, message: 'Cash flow entry created.', id: result.insertId });
    } catch (error) { res.status(500).json({ success: false, message: 'Server error.' }); }
});

// DELETE /api/cashflow/:id
router.delete('/:id', authenticate, async (req, res) => {
    try {
        await pool.execute('DELETE FROM cash_flow WHERE id = ?', [req.params.id]);
        res.json({ success: true, message: 'Entry deleted.' });
    } catch (error) { res.status(500).json({ success: false, message: 'Server error.' }); }
});

module.exports = router;
