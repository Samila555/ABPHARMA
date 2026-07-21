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
connectDB();

// Security Middleware
app.use(helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
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

// Body Parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

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
});

module.exports = app;
