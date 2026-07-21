const express = require('express');
const { pool } = require('../config/database');
const router = express.Router();

// Public medicine search for customer-facing website
router.get('/medicines', async (req, res) => {
    try {
        const { search, category_id, page = 1, limit = 20, featured, sort = 'name' } = req.query;
        let query = `
      SELECT m.id, m.name, m.brand_name, m.generic_name, m.selling_price, m.image, m.status,
        m.quantity, m.description, m.strength, m.dosage_form, m.unit, m.requires_prescription,
        m.uses, m.side_effects, m.storage_conditions, m.warnings, m.is_featured,
        c.name as category_name, m.category_id
      FROM medicines m LEFT JOIN categories c ON m.category_id = c.id
      WHERE m.is_active = 1 AND m.status != 'discontinued'
    `;
        const params = [];
        if (search) {
            query += ' AND (m.name LIKE ? OR m.brand_name LIKE ? OR m.generic_name LIKE ? OR m.barcode LIKE ?)';
            params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
        }
        if (category_id) { query += ' AND m.category_id = ?'; params.push(category_id); }
        if (featured === 'true') { query += ' AND m.is_featured = 1'; }
        const countQuery = query.replace(/SELECT m\.id.*c\.name as category_name, m\.category_id/, 'SELECT COUNT(*) as total');
        const [countRows] = await pool.execute('SELECT COUNT(*) as total FROM medicines m WHERE m.is_active = 1 AND m.status != \'discontinued\'' + (search ? ' AND (m.name LIKE ? OR m.brand_name LIKE ? OR m.generic_name LIKE ? OR m.barcode LIKE ?)' : '') + (category_id ? ' AND m.category_id = ?' : '') + (featured === 'true' ? ' AND m.is_featured = 1' : ''), params);

        const sortMap = { name: 'm.name ASC', price_asc: 'm.selling_price ASC', price_desc: 'm.selling_price DESC', newest: 'm.created_at DESC' };
        query += ` ORDER BY ${sortMap[sort] || 'm.created_at DESC'} LIMIT ? OFFSET ?`;
        params.push(parseInt(limit), (parseInt(page) - 1) * parseInt(limit));
        const [rows] = await pool.execute(query, params);
        res.json({ success: true, data: rows, total: countRows[0].total, page: parseInt(page), pages: Math.ceil(countRows[0].total / limit) });
    } catch (error) { res.status(500).json({ success: false, message: 'Server error.' }); }
});

// Public medicine detail
router.get('/medicines/:id', async (req, res) => {
    try {
        const [rows] = await pool.execute(`
      SELECT m.*, c.name as category_name FROM medicines m
      LEFT JOIN categories c ON m.category_id = c.id
      WHERE m.id = ? AND m.is_active = 1`, [req.params.id]);
        if (!rows.length) return res.status(404).json({ success: false, message: 'Medicine not found.' });
        res.json({ success: true, data: rows[0] });
    } catch (error) { res.status(500).json({ success: false, message: 'Server error.' }); }
});

// Public categories
router.get('/categories', async (req, res) => {
    try {
        const [rows] = await pool.execute(`
      SELECT c.*, COUNT(m.id) as medicine_count FROM categories c
      LEFT JOIN medicines m ON c.id = m.category_id AND m.is_active = 1
      WHERE c.is_active = 1 GROUP BY c.id ORDER BY c.sort_order, c.name`);
        res.json({ success: true, data: rows });
    } catch (error) { res.status(500).json({ success: false, message: 'Server error.' }); }
});

// Featured medicines
router.get('/featured', async (req, res) => {
    try {
        const [rows] = await pool.execute(
            'SELECT id, name, brand_name, generic_name, selling_price, image, description, status, strength, dosage_form FROM medicines WHERE is_featured = 1 AND is_active = 1 AND status != ? ORDER BY RAND() LIMIT 8',
            ['discontinued']
        );
        res.json({ success: true, data: rows });
    } catch (error) { res.status(500).json({ success: false, message: 'Server error.' }); }
});

// Today's offers
router.get('/offers', async (req, res) => {
    try {
        const [rows] = await pool.execute(`
      SELECT o.*, m.name as medicine_name, m.selling_price, m.image as medicine_image FROM offers o
      LEFT JOIN medicines m ON o.medicine_id = m.id
      WHERE o.is_active = 1 AND (o.end_date IS NULL OR o.end_date >= CURDATE()) ORDER BY o.created_at DESC LIMIT 10`);
        res.json({ success: true, data: rows });
    } catch (error) { res.status(500).json({ success: false, message: 'Server error.' }); }
});

// Newsletter subscription
router.post('/newsletter', async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ success: false, message: 'Email is required.' });
        await pool.execute('INSERT INTO newsletter (email) VALUES (?) ON DUPLICATE KEY UPDATE is_active = 1', [email]);
        res.json({ success: true, message: 'Subscribed successfully!' });
    } catch (error) { res.status(500).json({ success: false, message: 'Server error.' }); }
});

// Contact form
router.post('/contact', async (req, res) => {
    try {
        const { name, email, phone, subject, message } = req.body;
        await pool.execute('INSERT INTO contact_messages (name, email, phone, subject, message) VALUES (?,?,?,?,?)',
            [name, email, phone, subject, message]);
        res.json({ success: true, message: 'Message sent successfully!' });
    } catch (error) { res.status(500).json({ success: false, message: 'Server error.' }); }
});

// Track QR scan
router.post('/track-scan', async (req, res) => {
    try {
        const { device_type, browser, os } = req.body;
        await pool.execute('INSERT INTO qr_scans (qr_code_id, device_type, browser, os, ip_address) VALUES (?,?,?,?,?)',
            ['main', device_type, browser, os, req.ip]);
        res.json({ success: true });
    } catch (error) { res.json({ success: false }); }
});

// Public CMS content (hero, about, etc.)
router.get('/cms', async (req, res) => {
    try {
        const [rows] = await pool.execute('SELECT section_key, content FROM cms_content ORDER BY section');
        res.json({ success: true, data: rows });
    } catch (error) { res.status(500).json({ success: false, message: 'Server error.' }); }
});

module.exports = router;

