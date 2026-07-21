const express = require('express');
const QRCode = require('qrcode');
const { pool } = require('../config/database');
const { authenticate, authorize } = require('../middleware/auth');
const router = express.Router();

// GET /api/qr/generate
router.get('/generate', authenticate, authorize('admin'), async (req, res) => {
    try {
        const url = process.env.PHARMACY_URL || 'http://localhost:5173';
        const qrDataUrl = await QRCode.toDataURL(url, {
            width: 512,
            margin: 2,
            color: { dark: '#0f4c7a', light: '#ffffff' },
            errorCorrectionLevel: 'H',
        });
        res.json({ success: true, qr: qrDataUrl, url });
    } catch (error) {
        res.status(500).json({ success: false, message: 'QR generation failed.', error: error.message });
    }
});

// POST /api/qr/scan - Track scan
router.post('/scan', async (req, res) => {
    try {
        const { device_type, browser, os, country, city } = req.body;
        await pool.execute(
            'INSERT INTO qr_scans (qr_code_id, device_type, browser, os, country, city, ip_address) VALUES (?,?,?,?,?,?,?)',
            ['main', device_type, browser, os, country, city, req.ip]
        );
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false });
    }
});

// GET /api/qr/analytics
router.get('/analytics', authenticate, async (req, res) => {
    try {
        const [total] = await pool.execute('SELECT COUNT(*) as total FROM qr_scans');
        const [byDevice] = await pool.execute('SELECT device_type, COUNT(*) as count FROM qr_scans GROUP BY device_type');
        const [byOS] = await pool.execute('SELECT os, COUNT(*) as count FROM qr_scans GROUP BY os');
        const [daily] = await pool.execute(
            'SELECT DATE(scanned_at) as date, COUNT(*) as count FROM qr_scans WHERE scanned_at >= DATE_SUB(NOW(), INTERVAL 30 DAY) GROUP BY DATE(scanned_at) ORDER BY date'
        );
        res.json({ success: true, data: { total: total[0].total, byDevice, byOS, daily } });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error.' });
    }
});

module.exports = router;
