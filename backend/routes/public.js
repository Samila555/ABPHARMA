const express = require('express');
const { pool } = require('../config/database');
const upload = require('../middleware/upload');
const router = express.Router();

const generateOrderNumber = () => `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

// Public medicine search for customer-facing website
router.get('/medicines', async (req, res) => {
    try {
        const { search, category_id, page = 1, limit = 20, featured, sort = 'newest', requires_prescription } = req.query;
        let query = `
      SELECT m.id, m.name, m.brand_name, m.generic_name, m.selling_price, m.image, m.status,
        m.quantity, m.description, m.strength, m.dosage_form, m.unit, m.requires_prescription,
        m.uses, m.side_effects, m.storage_conditions, m.warnings, m.is_featured,
        c.name as category_name, m.category_id
      FROM medicines m LEFT JOIN categories c ON m.category_id = c.id
      WHERE m.is_active = 1 AND m.status != 'discontinued'
    `;
        const params = [];
        const countParams = [];
        if (search) {
            const searchClause = ' AND (m.name LIKE ? OR m.brand_name LIKE ? OR m.generic_name LIKE ? OR m.barcode LIKE ?)';
            query += searchClause;
            params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
            countParams.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
        }
        if (category_id) {
            query += ' AND m.category_id = ?';
            params.push(category_id);
            countParams.push(category_id);
        }
        if (featured === 'true') { query += ' AND m.is_featured = 1'; }
        if (requires_prescription === 'true') { query += ' AND m.requires_prescription = 1'; }
        if (requires_prescription === 'false') { query += ' AND m.requires_prescription = 0'; }

        // Build a clean separate count query using the same conditions
        let countSql = 'SELECT COUNT(*) as total FROM medicines m WHERE m.is_active = 1 AND m.status != \'discontinued\'';
        if (search) countSql += ' AND (m.name LIKE ? OR m.brand_name LIKE ? OR m.generic_name LIKE ? OR m.barcode LIKE ?)';
        if (category_id) countSql += ' AND m.category_id = ?';
        if (featured === 'true') countSql += ' AND m.is_featured = 1';
        if (requires_prescription === 'true') countSql += ' AND m.requires_prescription = 1';
        if (requires_prescription === 'false') countSql += ' AND m.requires_prescription = 0';

        const [countRows] = await pool.query(countSql, countParams);
        const sortMap = { name: 'm.name ASC', price_asc: 'm.selling_price ASC', price_desc: 'm.selling_price DESC', newest: 'm.created_at DESC' };
        query += ` ORDER BY ${sortMap[sort] || 'm.created_at DESC'} LIMIT ? OFFSET ?`;
        const limitNum = parseInt(limit) || 20;
        const offsetNum = (parseInt(page) - 1) * limitNum;
        const [rows] = await pool.query(query, [...params, limitNum, offsetNum]);
        res.json({ success: true, data: rows, total: countRows[0].total, page: parseInt(page), pages: Math.ceil(countRows[0].total / limitNum) });
    } catch (error) {
        console.error('GET /api/public/medicines error:', error);
        res.status(500).json({ success: false, message: 'Server error.', error: error.message });
    }
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
    } catch (error) { res.status(500).json({ success: false, message: 'Server error.', error: error.message }); }
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
        // 'section' is the actual column name; aliased as section_key for frontend compatibility
        const [rows] = await pool.execute('SELECT section AS section_key, content FROM cms_content WHERE is_active = 1 ORDER BY id');
        res.json({ success: true, data: rows });
    } catch (error) {
        console.error('GET /api/public/cms error:', error);
        res.status(500).json({ success: false, message: 'Server error.', error: error.message });
    }
});

// POST /api/public/orders (Customer Checkout with Screenshot)
router.post('/orders', upload('payments').single('screenshot'), async (req, res) => {
    const conn = await pool.getConnection();
    await conn.beginTransaction();
    try {
        const { customer_name, customer_phone, customer_email, payment_method, items_json } = req.body;
        const items = JSON.parse(items_json || '[]');

        let subtotal = 0;
        for (const item of items) {
            subtotal += (item.selling_price * item.quantity);
        }

        const screenshotPath = req.file ? req.file.path : null;
        const order_number = generateOrderNumber();

        const [orderResult] = await conn.execute(`
            INSERT INTO orders (order_number, customer_name, customer_phone, customer_email,
            order_type, payment_method, subtotal, total, amount_paid, change_amount,
            status, payment_status, payment_screenshot)
            VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`,
            [order_number, customer_name, customer_phone, customer_email || null,
                'online', payment_method, subtotal, subtotal, 0, 0, 'pending', 'pending', screenshotPath]
        );

        const orderId = orderResult.insertId;

        for (const item of items) {
            await conn.execute(`
                INSERT INTO order_items (order_id, medicine_id, medicine_name, quantity, unit_price, total)
                VALUES (?,?,?,?,?,?)`,
                [orderId, item.id || null, item.name, item.quantity, item.selling_price, item.selling_price * item.quantity]
            );
        }

        await conn.commit();
        res.status(201).json({ success: true, message: 'Order submitted for verification.', order_number });
    } catch (error) {
        await conn.rollback();
        console.error("Public Order Error:", error);
        res.status(500).json({ success: false, message: 'Server error.', error: String(error) });
    } finally {
        conn.release();
    }
});

module.exports = router;

