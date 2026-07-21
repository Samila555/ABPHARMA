const express = require('express');
const { pool } = require('../config/database');
const { authenticate } = require('../middleware/auth');
const router = express.Router();

// GET sales report
router.get('/sales', authenticate, async (req, res) => {
    try {
        const { from_date, to_date, group_by = 'day' } = req.query;
        const fromDate = from_date || new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];
        const toDate = to_date || new Date().toISOString().split('T')[0];
        let format = group_by === 'month' ? '%Y-%m' : group_by === 'year' ? '%Y' : '%Y-%m-%d';
        const [rows] = await pool.execute(`
      SELECT DATE_FORMAT(created_at, ?) as period,
        COUNT(*) as orders, SUM(total) as revenue,
        SUM(discount) as discounts, SUM(tax) as taxes
      FROM orders WHERE DATE(created_at) BETWEEN ? AND ?
      AND status != 'cancelled' GROUP BY period ORDER BY period`,
            [format, fromDate, toDate]
        );
        const [summary] = await pool.execute(`
      SELECT COUNT(*) as total_orders, COALESCE(SUM(total),0) as total_revenue,
        COALESCE(SUM(discount),0) as total_discounts, COALESCE(AVG(total),0) as avg_order_value
      FROM orders WHERE DATE(created_at) BETWEEN ? AND ? AND status != 'cancelled'`,
            [fromDate, toDate]
        );
        res.json({ success: true, data: rows, summary: summary[0], period: { from: fromDate, to: toDate } });
    } catch (error) { res.status(500).json({ success: false, message: 'Server error.' }); }
});

// GET inventory report
router.get('/inventory', authenticate, async (req, res) => {
    try {
        const [rows] = await pool.execute(`
      SELECT m.id, m.name, m.barcode, m.quantity, m.min_stock_level,
        m.selling_price, m.purchase_price, m.expiry_date, m.status,
        c.name as category_name,
        (m.quantity * m.purchase_price) as stock_value,
        CASE WHEN m.quantity <= 0 THEN 'out_of_stock'
             WHEN m.quantity <= m.min_stock_level THEN 'low_stock'
             WHEN m.expiry_date < CURDATE() THEN 'expired'
             WHEN m.expiry_date <= DATE_ADD(CURDATE(), INTERVAL 30 DAY) THEN 'expiring_soon'
             ELSE 'ok' END as stock_status
      FROM medicines m LEFT JOIN categories c ON m.category_id = c.id
      WHERE m.is_active = 1 ORDER BY m.name`);
        const totalValue = rows.reduce((sum, r) => sum + parseFloat(r.stock_value || 0), 0);
        const summary = {
            total: rows.length,
            out_of_stock: rows.filter(r => r.stock_status === 'out_of_stock').length,
            low_stock: rows.filter(r => r.stock_status === 'low_stock').length,
            expired: rows.filter(r => r.stock_status === 'expired').length,
            expiring_soon: rows.filter(r => r.stock_status === 'expiring_soon').length,
            total_value: totalValue,
        };
        res.json({ success: true, data: rows, summary });
    } catch (error) { res.status(500).json({ success: false, message: 'Server error.' }); }
});

// GET expiry report
router.get('/expiry', authenticate, async (req, res) => {
    try {
        const [rows] = await pool.execute(`
      SELECT m.*, c.name as category_name, s.name as supplier_name,
        DATEDIFF(m.expiry_date, CURDATE()) as days_left
      FROM medicines m
      LEFT JOIN categories c ON m.category_id = c.id
      LEFT JOIN suppliers s ON m.supplier_id = s.id
      WHERE m.expiry_date <= DATE_ADD(CURDATE(), INTERVAL 90 DAY) AND m.is_active = 1
      ORDER BY m.expiry_date ASC`);
        res.json({ success: true, data: rows });
    } catch (error) { res.status(500).json({ success: false, message: 'Server error.' }); }
});

// GET profit/loss report
router.get('/profit', authenticate, async (req, res) => {
    try {
        const { from_date, to_date } = req.query;
        const fromDate = from_date || new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];
        const toDate = to_date || new Date().toISOString().split('T')[0];
        const [sales] = await pool.execute(
            'SELECT COALESCE(SUM(total),0) as revenue FROM orders WHERE DATE(created_at) BETWEEN ? AND ? AND status != ? AND payment_status = ?',
            [fromDate, toDate, 'cancelled', 'paid']
        );
        const [purchases] = await pool.execute(
            'SELECT COALESCE(SUM(total),0) as cost FROM purchase_orders WHERE DATE(created_at) BETWEEN ? AND ? AND status = ?',
            [fromDate, toDate, 'received']
        );
        const [expenses] = await pool.execute(
            'SELECT COALESCE(SUM(amount),0) as total FROM cash_flow WHERE type = ? AND date BETWEEN ? AND ?',
            ['expense', fromDate, toDate]
        );
        const revenue = parseFloat(sales[0].revenue);
        const cost = parseFloat(purchases[0].cost);
        const expense = parseFloat(expenses[0].total);
        res.json({
            success: true,
            data: { revenue, cost, expenses: expense, gross_profit: revenue - cost, net_profit: revenue - cost - expense, period: { from: fromDate, to: toDate } }
        });
    } catch (error) { res.status(500).json({ success: false, message: 'Server error.' }); }
});

// GET customer report
router.get('/customers', authenticate, async (req, res) => {
    try {
        const [rows] = await pool.execute(`
      SELECT c.*, COUNT(o.id) as order_count, COALESCE(SUM(o.total),0) as total_spent
      FROM customers c LEFT JOIN orders o ON c.id = o.customer_id AND o.status != 'cancelled'
      WHERE c.is_active = 1 GROUP BY c.id ORDER BY total_spent DESC LIMIT 100`);
        res.json({ success: true, data: rows });
    } catch (error) { res.status(500).json({ success: false, message: 'Server error.' }); }
});

module.exports = router;
