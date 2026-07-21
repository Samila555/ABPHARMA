const express = require('express');
const { pool } = require('../config/database');
const { authenticate, authorize } = require('../middleware/auth');
const { v4: uuidv4 } = require('uuid');
const upload = require('../middleware/upload');
const router = express.Router();

// Generate order number
const generateOrderNumber = () => `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

// GET /api/orders
router.get('/', authenticate, async (req, res) => {
    try {
        const { status, payment_status, order_type, search, from_date, to_date, page = 1, limit = 20 } = req.query;
        let query = 'SELECT o.*, u.name as cashier_name FROM orders o LEFT JOIN users u ON o.cashier_id = u.id WHERE 1=1';
        const params = [];
        if (status) { query += ' AND o.status = ?'; params.push(status); }
        if (payment_status) { query += ' AND o.payment_status = ?'; params.push(payment_status); }
        if (order_type) { query += ' AND o.order_type = ?'; params.push(order_type); }
        if (search) { query += ' AND (o.order_number LIKE ? OR o.customer_name LIKE ? OR o.customer_phone LIKE ?)'; params.push(`%${search}%`, `%${search}%`, `%${search}%`); }
        if (from_date) { query += ' AND DATE(o.created_at) >= ?'; params.push(from_date); }
        if (to_date) { query += ' AND DATE(o.created_at) <= ?'; params.push(to_date); }
        const countQuery = query.replace('SELECT o.*, u.name as cashier_name', 'SELECT COUNT(*) as total');
        const [countRows] = await pool.execute(countQuery, params);
        const total = countRows[0].total;
        query += ' ORDER BY o.created_at DESC LIMIT ? OFFSET ?';
        params.push(parseInt(limit), (parseInt(page) - 1) * parseInt(limit));
        const [rows] = await pool.execute(query, params);
        res.json({ success: true, data: rows, total, page: parseInt(page), pages: Math.ceil(total / limit) });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error.', error: error.message });
    }
});

// GET /api/orders/:id
router.get('/:id', authenticate, async (req, res) => {
    try {
        const [orders] = await pool.execute('SELECT * FROM orders WHERE id = ?', [req.params.id]);
        if (!orders.length) return res.status(404).json({ success: false, message: 'Order not found.' });
        const [items] = await pool.execute('SELECT * FROM order_items WHERE order_id = ?', [req.params.id]);
        res.json({ success: true, data: { ...orders[0], items } });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error.' });
    }
});

// POST /api/orders (POS + Online)
router.post('/', authenticate, async (req, res) => {
    const conn = await pool.getConnection();
    await conn.beginTransaction();
    try {
        const {
            customer_id, customer_name, customer_phone, customer_email, order_type = 'pos',
            items, payment_method = 'cash', discount = 0, discount_type = 'fixed',
            tax_rate = 0, delivery_type = 'pickup', delivery_address, delivery_fee = 0,
            prescription_id, notes, amount_paid
        } = req.body;

        // Calculate totals
        let subtotal = 0;
        for (const item of items) {
            subtotal += (item.unit_price * item.quantity) - (item.item_discount || 0);
        }
        const discountAmount = discount_type === 'percentage' ? subtotal * discount / 100 : parseFloat(discount);
        const taxAmount = (subtotal - discountAmount) * tax_rate / 100;
        const total = subtotal - discountAmount + taxAmount + parseFloat(delivery_fee);
        const paidAmount = parseFloat(amount_paid) || total;
        const change = paidAmount - total;
        const order_number = generateOrderNumber();

        const [orderResult] = await conn.execute(`
      INSERT INTO orders (order_number, customer_id, customer_name, customer_phone, customer_email,
        order_type, payment_method, subtotal, discount, discount_type, tax, tax_rate, total,
        amount_paid, change_amount, delivery_type, delivery_address, delivery_fee,
        prescription_id, notes, cashier_id, status, payment_status)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
            [order_number, customer_id || null, customer_name, customer_phone, customer_email,
                order_type, payment_method, subtotal, discountAmount, discount_type, taxAmount,
                tax_rate, total, paidAmount, Math.max(0, change), delivery_type, delivery_address,
                delivery_fee, prescription_id || null, notes, req.user.id,
                order_type === 'pos' ? 'completed' : 'pending',
                order_type === 'pos' ? 'paid' : 'pending'
            ]
        );
        const orderId = orderResult.insertId;

        // Insert items and update stock
        for (const item of items) {
            const itemTotal = (item.unit_price * item.quantity) - (item.item_discount || 0);
            await conn.execute(`
        INSERT INTO order_items (order_id, medicine_id, medicine_name, barcode, batch_number, quantity, unit_price, discount, total)
        VALUES (?,?,?,?,?,?,?,?,?)`,
                [orderId, item.medicine_id || null, item.medicine_name, item.barcode, item.batch_number,
                    item.quantity, item.unit_price, item.item_discount || 0, itemTotal]
            );
            if (item.medicine_id) {
                const [med] = await conn.execute('SELECT quantity FROM medicines WHERE id = ?', [item.medicine_id]);
                const newQty = Math.max(0, (med[0]?.quantity || 0) - item.quantity);
                await conn.execute('UPDATE medicines SET quantity = ? WHERE id = ?', [newQty, item.medicine_id]);
                await conn.execute(
                    'INSERT INTO inventory_transactions (medicine_id, transaction_type, quantity, balance_before, balance_after, reference_type, reference_id, created_by) VALUES (?,?,?,?,?,?,?,?)',
                    [item.medicine_id, 'stock_out', item.quantity, med[0]?.quantity || 0, newQty, 'order', orderId, req.user.id]
                );
            }
        }

        // Update customer totals
        if (customer_id) {
            await conn.execute('UPDATE customers SET total_purchases = total_purchases + ? WHERE id = ?', [total, customer_id]);
        }

        // Cash flow entry
        if (order_type === 'pos') {
            await conn.execute(
                'INSERT INTO cash_flow (type, category, description, amount, payment_method, reference_type, reference_id, date, created_by) VALUES (?,?,?,?,?,?,?,CURDATE(),?)',
                ['income', 'Sales', `Order ${order_number}`, total, payment_method, 'order', orderId, req.user.id]
            );
        }

        await conn.commit();
        res.status(201).json({ success: true, message: 'Order created successfully.', order_number, id: orderId });
    } catch (error) {
        await conn.rollback();
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error.', error: error.message });
    } finally {
        conn.release();
    }
});

// PATCH /api/orders/:id/status
router.patch('/:id/status', authenticate, async (req, res) => {
    try {
        const { status, payment_status } = req.body;
        await pool.execute('UPDATE orders SET status=?, payment_status=COALESCE(?,payment_status) WHERE id=?',
            [status, payment_status || null, req.params.id]);
        res.json({ success: true, message: 'Order updated.' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error.' });
    }
});

// POST /api/orders/:id/payment-proof
router.post('/:id/payment-proof', authenticate, upload('payments').single('screenshot'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ success: false, message: 'No screenshot uploaded.' });
        const screenshotPath = `/uploads/payments/${req.file.filename}`;
        await pool.execute('UPDATE orders SET payment_screenshot = ? WHERE id = ?', [screenshotPath, req.params.id]);
        res.json({ success: true, message: 'Payment screenshot uploaded successfully.', screenshot: screenshotPath });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error.', error: error.message });
    }
});

module.exports = router;
