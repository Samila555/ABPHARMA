const express = require('express');
const { pool } = require('../config/database');
const { authenticate, authorize } = require('../middleware/auth');
const router = express.Router();

// GET all CMS sections
router.get('/', async (req, res) => {
    try {
        const [rows] = await pool.execute('SELECT * FROM cms_content ORDER BY section');
        res.json({ success: true, data: rows });
    } catch (error) { res.status(500).json({ success: false, message: 'Server error.' }); }
});

// GET specific section
router.get('/:section', async (req, res) => {
    try {
        const [rows] = await pool.execute('SELECT * FROM cms_content WHERE section = ?', [req.params.section]);
        res.json({ success: true, data: rows[0] || null });
    } catch (error) { res.status(500).json({ success: false, message: 'Server error.' }); }
});

// PUT update section
router.put('/:section', authenticate, authorize('admin'), async (req, res) => {
    try {
        const { title, content, data, image } = req.body;
        await pool.execute(
            `INSERT INTO cms_content (section, title, content, data, image, updated_by) VALUES (?,?,?,?,?,?)
       ON DUPLICATE KEY UPDATE title=?, content=?, data=?, image=?, updated_by=?`,
            [req.params.section, title, content, data ? JSON.stringify(data) : null, image, req.user.id,
                title, content, data ? JSON.stringify(data) : null, image, req.user.id]
        );
        res.json({ success: true, message: 'Content updated.' });
    } catch (error) { res.status(500).json({ success: false, message: 'Server error.', error: error.message }); }
});

// GET banners
router.get('/banners/list', async (req, res) => {
    try {
        const [rows] = await pool.execute('SELECT * FROM banners WHERE is_active = 1 ORDER BY sort_order, id');
        res.json({ success: true, data: rows });
    } catch (error) { res.status(500).json({ success: false, message: 'Server error.' }); }
});

// POST banner
router.post('/banners', authenticate, authorize('admin'), async (req, res) => {
    try {
        const { title, subtitle, image, button_text, button_link, sort_order } = req.body;
        const [result] = await pool.execute(
            'INSERT INTO banners (title, subtitle, image, button_text, button_link, sort_order) VALUES (?,?,?,?,?,?)',
            [title, subtitle, image, button_text, button_link, sort_order || 0]
        );
        res.status(201).json({ success: true, message: 'Banner created.', id: result.insertId });
    } catch (error) { res.status(500).json({ success: false, message: 'Server error.' }); }
});

// GET offers
router.get('/offers/list', async (req, res) => {
    try {
        const [rows] = await pool.execute(`
      SELECT o.*, m.name as medicine_name, c.name as category_name FROM offers o
      LEFT JOIN medicines m ON o.medicine_id = m.id
      LEFT JOIN categories c ON o.category_id = c.id
      WHERE o.is_active = 1 AND (o.end_date IS NULL OR o.end_date >= CURDATE())
      ORDER BY o.created_at DESC`);
        res.json({ success: true, data: rows });
    } catch (error) { res.status(500).json({ success: false, message: 'Server error.' }); }
});

// POST offer
router.post('/offers', authenticate, authorize('admin'), async (req, res) => {
    try {
        const { title, description, discount_type, discount_value, medicine_id, category_id, start_date, end_date, image } = req.body;
        const [result] = await pool.execute(
            'INSERT INTO offers (title, description, discount_type, discount_value, medicine_id, category_id, start_date, end_date, image) VALUES (?,?,?,?,?,?,?,?,?)',
            [title, description, discount_type || 'percentage', discount_value, medicine_id || null, category_id || null, start_date || null, end_date || null, image]
        );
        res.status(201).json({ success: true, message: 'Offer created.', id: result.insertId });
    } catch (error) { res.status(500).json({ success: false, message: 'Server error.' }); }
});

module.exports = router;
