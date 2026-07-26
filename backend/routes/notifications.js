const express = require('express');
const { pool } = require('../config/database');
const { authenticate } = require('../middleware/auth');
const router = express.Router();

router.get('/', authenticate, async (req, res) => {
    try {
        const { is_read, page = 1, limit = 20 } = req.query;
        let query = 'SELECT * FROM notifications WHERE (user_id = ? OR user_id IS NULL)';
        const params = [req.user.id];
        if (is_read !== undefined) { query += ' AND is_read = ?'; params.push(is_read === 'true' ? 1 : 0); }
        const [countRows] = await pool.query(query.replace('SELECT *', 'SELECT COUNT(*) as total'), params);
        query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
        const limitNum = parseInt(limit) || 20;
        const offsetNum = (parseInt(page) - 1) * limitNum;
        const [rows] = await pool.query(query, [...params, limitNum, offsetNum]);
        res.json({ success: true, data: rows, total: countRows[0].total });
    } catch (error) { res.status(500).json({ success: false, message: 'Server error.' }); }
});

router.patch('/:id/read', authenticate, async (req, res) => {
    try {
        await pool.execute('UPDATE notifications SET is_read = 1 WHERE id = ?', [req.params.id]);
        res.json({ success: true, message: 'Marked as read.' });
    } catch (error) { res.status(500).json({ success: false, message: 'Server error.' }); }
});

router.patch('/read-all', authenticate, async (req, res) => {
    try {
        await pool.execute('UPDATE notifications SET is_read = 1 WHERE user_id = ? OR user_id IS NULL', [req.user.id]);
        res.json({ success: true, message: 'All marked as read.' });
    } catch (error) { res.status(500).json({ success: false, message: 'Server error.' }); }
});

router.get('/count', authenticate, async (req, res) => {
    try {
        const [rows] = await pool.execute(
            'SELECT COUNT(*) as count FROM notifications WHERE (user_id = ? OR user_id IS NULL) AND is_read = 0',
            [req.user.id]
        );
        res.json({ success: true, count: rows[0].count });
    } catch (error) { res.status(500).json({ success: false, message: 'Server error.' }); }
});

module.exports = router;
