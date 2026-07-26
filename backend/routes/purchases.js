const express = require('express');
const { pool } = require('../config/database');
const { authenticate, authorize } = require('../middleware/auth');
const router = express.Router();

const generatePONumber = () => `PO-${Date.now()}-${Math.floor(Math.random() * 100)}`;

router.get('/', authenticate, async (req, res) => {
    try {
        const { status, supplier_id, page = 1, limit = 20 } = req.query;
        let query = `SELECT po.*, s.name as supplier_name FROM purchase_orders po LEFT JOIN suppliers s ON po.supplier_id = s.id WHERE 1=1`;
        const params = [];
        if (status) { query += ' AND po.status = ?'; params.push(status); }
        if (supplier_id) { query += ' AND po.supplier_id = ?'; params.push(supplier_id); }
        const [countRows] = await pool.query(query.replace('SELECT po.*, s.name as supplier_name', 'SELECT COUNT(*) as total'), params);
        const total = countRows[0].total;
        query += ' ORDER BY po.created_at DESC LIMIT ? OFFSET ?';
        const limitNum = parseInt(limit) || 20;
        const offsetNum = (parseInt(page) - 1) * limitNum;
        const [rows] = await pool.query(query, [...params, limitNum, offsetNum]);
        res.json({ success: true, data: rows, total, page: parseInt(page), pages: Math.ceil(total / limitNum) });
    } catch (error) { res.status(500).json({ success: false, message: 'Server error.' }); }
});

router.get('/:id', authenticate, async (req, res) => {
    try {
        const [orders] = await pool.execute('SELECT po.*, s.name as supplier_name FROM purchase_orders po LEFT JOIN suppliers s ON po.supplier_id = s.id WHERE po.id = ?', [req.params.id]);
        if (!orders.length) return res.status(404).json({ success: false, message: 'Purchase order not found.' });
        const [items] = await pool.execute('SELECT * FROM purchase_order_items WHERE purchase_order_id = ?', [req.params.id]);
        res.json({ success: true, data: { ...orders[0], items } });
    } catch (error) { res.status(500).json({ success: false, message: 'Server error.' }); }
});

router.post('/', authenticate, authorize('admin', 'pharmacist'), async (req, res) => {
    const conn = await pool.getConnection();
    await conn.beginTransaction();
    try {
        const { supplier_id, items, expected_date, notes, invoice_number } = req.body;
        let subtotal = 0;
        for (const item of items) subtotal += item.unit_cost * item.quantity_ordered;
        const po_number = generatePONumber();
        const [result] = await conn.execute(
            'INSERT INTO purchase_orders (po_number, supplier_id, subtotal, total, expected_date, notes, invoice_number, created_by) VALUES (?,?,?,?,?,?,?,?)',
            [po_number, supplier_id || null, subtotal, subtotal, expected_date || null, notes, invoice_number, req.user.id]
        );
        for (const item of items) {
            await conn.execute(
                'INSERT INTO purchase_order_items (purchase_order_id, medicine_id, medicine_name, quantity_ordered, unit_cost, total, batch_number, expiry_date) VALUES (?,?,?,?,?,?,?,?)',
                [result.insertId, item.medicine_id || null, item.medicine_name, item.quantity_ordered, item.unit_cost, item.unit_cost * item.quantity_ordered, item.batch_number, item.expiry_date || null]
            );
        }
        await conn.commit();
        res.status(201).json({ success: true, message: 'Purchase order created.', po_number, id: result.insertId });
    } catch (error) {
        await conn.rollback();
        res.status(500).json({ success: false, message: 'Server error.', error: error.message });
    } finally { conn.release(); }
});

// POST /api/purchases/:id/receive - Receive goods
router.post('/:id/receive', authenticate, authorize('admin', 'pharmacist'), async (req, res) => {
    const conn = await pool.getConnection();
    await conn.beginTransaction();
    try {
        const { items } = req.body;
        for (const item of items) {
            if (item.quantity_received > 0) {
                await conn.execute('UPDATE purchase_order_items SET quantity_received = ? WHERE id = ?', [item.quantity_received, item.id]);
                if (item.medicine_id) {
                    const [med] = await conn.execute('SELECT quantity FROM medicines WHERE id = ?', [item.medicine_id]);
                    const newQty = (med[0]?.quantity || 0) + item.quantity_received;
                    await conn.execute('UPDATE medicines SET quantity = ?, batch_number = ?, expiry_date = ? WHERE id = ?',
                        [newQty, item.batch_number || null, item.expiry_date || null, item.medicine_id]);
                    await conn.execute(
                        'INSERT INTO inventory_transactions (medicine_id, transaction_type, quantity, balance_before, balance_after, reference_type, reference_id, created_by) VALUES (?,?,?,?,?,?,?,?)',
                        [item.medicine_id, 'stock_in', item.quantity_received, med[0]?.quantity || 0, newQty, 'purchase', req.params.id, req.user.id]
                    );
                }
            }
        }
        await conn.execute("UPDATE purchase_orders SET status = 'received', received_date = CURDATE() WHERE id = ?", [req.params.id]);
        await conn.commit();
        res.json({ success: true, message: 'Goods received and stock updated.' });
    } catch (error) {
        await conn.rollback();
        res.status(500).json({ success: false, message: 'Server error.' });
    } finally { conn.release(); }
});

module.exports = router;
