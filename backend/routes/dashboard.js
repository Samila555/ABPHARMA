const express = require('express');
const { pool } = require('../config/database');
const { authenticate, authorize } = require('../middleware/auth');
const router = express.Router();

// GET /api/dashboard/stats
router.get('/stats', authenticate, async (req, res) => {
    try {
        const today = new Date().toISOString().split('T')[0];
        const thisMonth = today.substring(0, 7);
        const thisYear = today.substring(0, 4);

        const queries = {
            todaySales: `SELECT COALESCE(SUM(total), 0) as value, COUNT(*) as count FROM orders WHERE DATE(created_at) = ? AND status != 'cancelled' AND payment_status = 'paid'`,
            monthlySales: `SELECT COALESCE(SUM(total), 0) as value FROM orders WHERE DATE_FORMAT(created_at, '%Y-%m') = ? AND status != 'cancelled' AND payment_status = 'paid'`,
            yearlySales: `SELECT COALESCE(SUM(total), 0) as value FROM orders WHERE YEAR(created_at) = ? AND status != 'cancelled' AND payment_status = 'paid'`,
            totalCustomers: `SELECT COUNT(*) as value FROM customers WHERE is_active = 1`,
            totalMedicines: `SELECT COUNT(*) as value FROM medicines WHERE is_active = 1`,
            lowStock: `SELECT COUNT(*) as value FROM medicines WHERE quantity <= min_stock_level AND is_active = 1`,
            expiredMedicines: `SELECT COUNT(*) as value FROM medicines WHERE expiry_date < CURDATE() AND is_active = 1`,
            expiringSoon: `SELECT COUNT(*) as value FROM medicines WHERE expiry_date BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 30 DAY) AND is_active = 1`,
            pendingOrders: `SELECT COUNT(*) as value FROM orders WHERE status IN ('pending','confirmed','processing')`,
            pendingPrescriptions: `SELECT COUNT(*) as value FROM prescriptions WHERE status = 'pending'`,
            totalRevenue: `SELECT COALESCE(SUM(amount),0) as value FROM cash_flow WHERE type = 'income' AND YEAR(date) = ?`,
            totalExpenses: `SELECT COALESCE(SUM(amount),0) as value FROM cash_flow WHERE type = 'expense' AND YEAR(date) = ?`,
        };

        const [todaySales] = await pool.execute(queries.todaySales, [today]);
        const [monthlySales] = await pool.execute(queries.monthlySales, [thisMonth]);
        const [yearlySales] = await pool.execute(queries.yearlySales, [thisYear]);
        const [customers] = await pool.execute(queries.totalCustomers);
        const [medicines] = await pool.execute(queries.totalMedicines);
        const [lowStock] = await pool.execute(queries.lowStock);
        const [expired] = await pool.execute(queries.expiredMedicines);
        const [expiringSoon] = await pool.execute(queries.expiringSoon);
        const [pendingOrders] = await pool.execute(queries.pendingOrders);
        const [pendingPrescriptions] = await pool.execute(queries.pendingPrescriptions);
        const [revenue] = await pool.execute(queries.totalRevenue, [thisYear]);
        const [expenses] = await pool.execute(queries.totalExpenses, [thisYear]);

        res.json({
            success: true,
            data: {
                todaySales: { value: todaySales[0].value, count: todaySales[0].count },
                monthlySales: { value: monthlySales[0].value },
                yearlySales: { value: yearlySales[0].value },
                totalCustomers: customers[0].value,
                totalMedicines: medicines[0].value,
                lowStock: lowStock[0].value,
                expiredMedicines: expired[0].value,
                expiringSoon: expiringSoon[0].value,
                pendingOrders: pendingOrders[0].value,
                pendingPrescriptions: pendingPrescriptions[0].value,
                totalRevenue: revenue[0].value,
                totalExpenses: expenses[0].value,
                profit: revenue[0].value - expenses[0].value,
            },
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error.', error: error.message });
    }
});

// GET /api/dashboard/sales-chart
router.get('/sales-chart', authenticate, async (req, res) => {
    try {
        const { period = 'monthly' } = req.query;
        let query, labels = [];
        if (period === 'daily') {
            query = `SELECT DATE(created_at) as label, COALESCE(SUM(total),0) as value
               FROM orders WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
               AND status != 'cancelled' GROUP BY DATE(created_at) ORDER BY label`;
        } else if (period === 'monthly') {
            query = `SELECT DATE_FORMAT(created_at, '%Y-%m') as label, COALESCE(SUM(total),0) as value
               FROM orders WHERE YEAR(created_at) = YEAR(NOW())
               AND status != 'cancelled' GROUP BY DATE_FORMAT(created_at, '%Y-%m') ORDER BY label`;
        } else {
            query = `SELECT YEAR(created_at) as label, COALESCE(SUM(total),0) as value
               FROM orders WHERE status != 'cancelled'
               GROUP BY YEAR(created_at) ORDER BY label DESC LIMIT 5`;
        }
        const [rows] = await pool.execute(query);
        res.json({ success: true, data: rows });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error.' });
    }
});

// GET /api/dashboard/top-medicines
router.get('/top-medicines', authenticate, async (req, res) => {
    try {
        const [rows] = await pool.execute(`
      SELECT oi.medicine_name, SUM(oi.quantity) as total_sold, SUM(oi.total) as revenue
      FROM order_items oi
      JOIN orders o ON oi.order_id = o.id
      WHERE o.status != 'cancelled' AND o.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
      GROUP BY oi.medicine_name ORDER BY total_sold DESC LIMIT 10
    `);
        res.json({ success: true, data: rows });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error.' });
    }
});

// GET /api/dashboard/recent-activities
router.get('/recent-activities', authenticate, async (req, res) => {
    try {
        const [rows] = await pool.execute(`
      SELECT al.*, u.name as user_name FROM activity_logs al
      LEFT JOIN users u ON al.user_id = u.id
      ORDER BY al.created_at DESC LIMIT 20
    `);
        res.json({ success: true, data: rows });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error.' });
    }
});

// GET /api/dashboard/recent-orders
router.get('/recent-orders', authenticate, async (req, res) => {
    try {
        const [rows] = await pool.execute(`
      SELECT * FROM orders ORDER BY created_at DESC LIMIT 10
    `);
        res.json({ success: true, data: rows });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error.' });
    }
});

// GET /api/dashboard/expiry-alerts
router.get('/expiry-alerts', authenticate, async (req, res) => {
    try {
        const [expired] = await pool.execute(`
      SELECT id, name, batch_number, expiry_date, quantity, selling_price,
        DATEDIFF(CURDATE(), expiry_date) as days_overdue
      FROM medicines WHERE expiry_date < CURDATE() AND is_active = 1
      ORDER BY expiry_date ASC LIMIT 20
    `);
        const [expiring] = await pool.execute(`
      SELECT id, name, batch_number, expiry_date, quantity, selling_price,
        DATEDIFF(expiry_date, CURDATE()) as days_remaining
      FROM medicines WHERE expiry_date BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 30 DAY) AND is_active = 1
      ORDER BY expiry_date ASC LIMIT 20
    `);
        res.json({ success: true, data: { expired, expiring } });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error.', error: error.message });
    }
});

module.exports = router;
