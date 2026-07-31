const express = require('express');
require('dotenv').config();
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');
const { connectDB } = require('./config/database');

// Route imports
const authRoutes = require('./routes/auth');
const medicineRoutes = require('./routes/medicines');
const categoryRoutes = require('./routes/categories');
const orderRoutes = require('./routes/orders');
const customerRoutes = require('./routes/customers');
const inventoryRoutes = require('./routes/inventory');
const purchaseRoutes = require('./routes/purchases');
const supplierRoutes = require('./routes/suppliers');
const dashboardRoutes = require('./routes/dashboard');
const reportsRoutes = require('./routes/reports');
const cashFlowRoutes = require('./routes/cashflow');
const notificationRoutes = require('./routes/notifications');
const userRoutes = require('./routes/users');
const cmsRoutes = require('./routes/cms');
const qrRoutes = require('./routes/qr');
const prescriptionRoutes = require('./routes/prescriptions');
const publicRoutes = require('./routes/public');

const app = express();

// Connect to Database
connectDB().then(async () => {
    // Auto-migrate image columns to LONGTEXT for base64 storage
    // This ensures images survive Render's ephemeral filesystem
    try {
        const { pool } = require('./config/database');
        const migrations = [
            'ALTER TABLE medicines MODIFY COLUMN image LONGTEXT',
            'ALTER TABLE categories MODIFY COLUMN image LONGTEXT',
            'ALTER TABLE prescriptions MODIFY COLUMN image LONGTEXT',
            'ALTER TABLE cms_content MODIFY COLUMN image LONGTEXT',
            'ALTER TABLE banners MODIFY COLUMN image LONGTEXT',
            'ALTER TABLE offers MODIFY COLUMN image LONGTEXT',
            'ALTER TABLE orders MODIFY COLUMN payment_screenshot LONGTEXT',
            'ALTER TABLE purchase_orders MODIFY COLUMN invoice_image LONGTEXT',
            'ALTER TABLE users MODIFY COLUMN avatar LONGTEXT',
        ];
        for (const sql of migrations) {
            await pool.query(sql).catch(() => { });
        }
        console.log('✅ Image columns verified as LONGTEXT');
    } catch (e) {
        console.log('⚠️  Image column migration skipped:', e.message);
    }

    // Auto-clean duplicates from previously bugged Excel imports
    try {
        const { pool } = require('./config/database');
        const [duplicates] = await pool.query(`
            SELECT name, COUNT(*) as count 
            FROM medicines 
            GROUP BY name 
            HAVING COUNT(*) > 1
        `);
        let deletedCount = 0;
        for (const dup of duplicates) {
            const [rows] = await pool.query('SELECT id FROM medicines WHERE name = ? ORDER BY id ASC', [dup.name]);
            const idsToDelete = rows.slice(1).map(r => r.id);
            if (idsToDelete.length > 0) {
                await pool.query('DELETE FROM inventory_transactions WHERE medicine_id IN (?)', [idsToDelete]);
                await pool.query('DELETE FROM medicines WHERE id IN (?)', [idsToDelete]);
                deletedCount += idsToDelete.length;
            }
        }
        if (deletedCount > 0) console.log(`✅ Auto-cleaned ${deletedCount} duplicate medicines`);
    } catch (e) { console.log('⚠️ Duplicate cleanup error:', e.message); }
});

// Security Middleware
app.use(helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    contentSecurityPolicy: {
        directives: {
            ...helmet.contentSecurityPolicy.getDefaultDirectives(),
            'img-src': ["'self'", 'data:', 'https:', 'blob:'],
        },
    },
}));

// Rate Limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 200,
    message: { success: false, message: 'Too many requests, please try again later.' },
});
app.use('/api/', limiter);

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: { success: false, message: 'Too many login attempts, please try again later.' },
});
app.use('/api/auth/login', authLimiter);

// CORS
app.use(cors({
    origin: [
        'http://localhost:5173',
        'http://localhost:3000',
        process.env.APP_URL,
    ].filter(Boolean),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Body Parser — 50mb limit needed for base64 image data in JSON payloads
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Logging
if (process.env.NODE_ENV !== 'production') {
    app.use(morgan('dev'));
}

// Static Files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/public', publicRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/medicines', medicineRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/purchases', purchaseRoutes);
app.use('/api/suppliers', supplierRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/cashflow', cashFlowRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/users', userRoutes);
app.use('/api/cms', cmsRoutes);
app.use('/api/qr', qrRoutes);
app.use('/api/prescriptions', prescriptionRoutes);

// Health Check
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: 'AB Pharma API is running',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
    });
});

// Config Check — verify Cloudinary and storage setup (non-sensitive)
app.get('/api/health/config', (req, res) => {
    const cloudinary = !!(
        process.env.CLOUDINARY_CLOUD_NAME &&
        process.env.CLOUDINARY_API_KEY &&
        process.env.CLOUDINARY_API_SECRET
    );
    res.json({
        success: true,
        cloudinary,
        storage: cloudinary ? 'cloudinary' : 'database-base64',
        nodeEnv: process.env.NODE_ENV || 'development',
        hasDb: !!process.env.DB_HOST,
    });
});

// Serve static React frontend files
app.use(express.static(path.join(__dirname, '../frontend/dist')));

// API 404 Handler
app.use('/api', (req, res) => {
    res.status(404).json({ success: false, message: 'API Route not found' });
});

// React App Fallback for any other request
app.use((req, res, next) => {
    if (req.method === 'GET') {
        res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
    } else {
        next();
    }
});

// Global Error Handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal Server Error',
        ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
    });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 AB Pharma Server running on port ${PORT}`);
    console.log(`🌐 API: http://localhost:${PORT}/api/health`);

    // Keep-alive: ping self every 14 minutes to prevent Render free tier sleep
    if (process.env.NODE_ENV === 'production' && process.env.RENDER_EXTERNAL_URL) {
        const https = require('https');
        setInterval(() => {
            const url = `${process.env.RENDER_EXTERNAL_URL}/api/health`;
            https.get(url, (res) => {
                console.log(`♻️  Keep-alive ping: ${res.statusCode}`);
            }).on('error', (e) => {
                console.error(`Keep-alive error: ${e.message}`);
            });
        }, 14 * 60 * 1000);
        console.log('✅ Keep-alive enabled');
    }
});

module.exports = app;

