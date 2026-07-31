const express = require('express');
const { pool } = require('../config/database');
const { authenticate, authorize } = require('../middleware/auth');
const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const [rows] = await pool.execute(`
            SELECT c.*, COUNT(m.id) as medicine_count 
            FROM categories c
            LEFT JOIN medicines m ON c.id = m.category_id AND m.is_active = 1
            WHERE c.is_active = 1 
            GROUP BY c.id 
            ORDER BY c.sort_order, c.name
        `);
        res.json({ success: true, data: rows });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error.' });
    }
});

router.post('/', authenticate, authorize('admin'), async (req, res) => {
    try {
        const { name, slug, description, image, parent_id, sort_order } = req.body;
        const [result] = await pool.execute(
            'INSERT INTO categories (name, slug, description, image, parent_id, sort_order) VALUES (?,?,?,?,?,?)',
            [name, slug || name.toLowerCase().replace(/\s+/g, '-'), description, image, parent_id || null, sort_order || 0]
        );
        res.status(201).json({ success: true, message: 'Category created.', id: result.insertId });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error.', error: error.message });
    }
});

router.put('/:id', authenticate, authorize('admin'), async (req, res) => {
    try {
        const { name, slug, description, image, parent_id, sort_order, is_active } = req.body;
        await pool.execute(
            'UPDATE categories SET name=?, slug=?, description=?, image=?, parent_id=?, sort_order=?, is_active=? WHERE id=?',
            [name, slug, description, image, parent_id || null, sort_order || 0, is_active !== false ? 1 : 0, req.params.id]
        );
        res.json({ success: true, message: 'Category updated.' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error.' });
    }
});

router.delete('/:id', authenticate, authorize('admin'), async (req, res) => {
    try {
        await pool.execute('UPDATE categories SET is_active = 0 WHERE id = ?', [req.params.id]);
        res.json({ success: true, message: 'Category deactivated.' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error.' });
    }
});

module.exports = router;
