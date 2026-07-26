const express = require('express');
const { pool } = require('../config/database');
const { authenticate, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');
const router = express.Router();

// GET /api/medicines/diag/images — diagnostic: check image data in DB
router.get('/diag/images', authenticate, authorize('admin'), async (req, res) => {
    try {
        const [rows] = await pool.query(
            'SELECT id, name, image FROM medicines WHERE is_active = 1 ORDER BY id DESC LIMIT 20'
        );
        const summary = {
            total: rows.length,
            nullImage: rows.filter(r => !r.image).length,
            localPaths: rows.filter(r => r.image && r.image.startsWith('/')).length,
            cloudinaryUrls: rows.filter(r => r.image && r.image.startsWith('http')).length,
            samples: rows.map(r => ({ id: r.id, name: r.name, image: r.image ? r.image.substring(0, 100) : null })),
        };
        res.json({ success: true, data: summary });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// GET /api/medicines - List with filters
router.get('/', async (req, res) => {
    try {
        const { search, category_id, status, low_stock, expiring_soon, page = 1, limit = 20 } = req.query;
        let query = `
      SELECT m.*, c.name as category_name, s.name as supplier_name
      FROM medicines m
      LEFT JOIN categories c ON m.category_id = c.id
      LEFT JOIN suppliers s ON m.supplier_id = s.id
      WHERE 1=1
    `;
        const params = [];
        if (search) {
            query += ` AND (m.name LIKE ? OR m.brand_name LIKE ? OR m.generic_name LIKE ? OR m.barcode LIKE ?)`;
            params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
        }
        if (category_id) { query += ` AND m.category_id = ?`; params.push(category_id); }
        if (status) { query += ` AND m.status = ?`; params.push(status); }
        if (low_stock === 'true') { query += ` AND m.quantity <= m.min_stock_level`; }
        if (expiring_soon === 'true') {
            query += ` AND m.expiry_date <= DATE_ADD(CURDATE(), INTERVAL 30 DAY) AND m.expiry_date >= CURDATE()`;
        }
        const countQuery = query.replace('SELECT m.*, c.name as category_name, s.name as supplier_name', 'SELECT COUNT(*) as total');
        const [countRows] = await pool.query(countQuery, params);
        const total = countRows[0].total;
        query += ` ORDER BY m.created_at DESC LIMIT ? OFFSET ?`;
        const limitNum = parseInt(limit) || 20;
        const offsetNum = (parseInt(page) - 1) * limitNum;
        const [rows] = await pool.query(query, [...params, limitNum, offsetNum]);
        res.json({ success: true, data: rows, total, page: parseInt(page), limit: limitNum, pages: Math.ceil(total / limitNum) });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
});

// GET /api/medicines/search/barcode/:barcode (MUST be before /:id)
router.get('/search/barcode/:barcode', authenticate, async (req, res) => {
    try {
        const [rows] = await pool.query(
            'SELECT * FROM medicines WHERE barcode = ? AND is_active = 1',
            [req.params.barcode]
        );
        if (!rows.length) return res.status(404).json({ success: false, message: 'Medicine not found.' });
        res.json({ success: true, data: rows[0] });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error.' });
    }
});

// GET /api/medicines/:id
router.get('/:id', async (req, res) => {
    try {
        const [rows] = await pool.query(`
      SELECT m.*, c.name as category_name, s.name as supplier_name
      FROM medicines m
      LEFT JOIN categories c ON m.category_id = c.id
      LEFT JOIN suppliers s ON m.supplier_id = s.id
      WHERE m.id = ?`, [req.params.id]);
        if (!rows.length) return res.status(404).json({ success: false, message: 'Medicine not found.' });
        res.json({ success: true, data: rows[0] });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error.' });
    }
});

// POST /api/medicines
router.post('/', authenticate, authorize('admin', 'pharmacist'), upload('medicines').single('image'), async (req, res) => {
    try {
        const {
            name, brand_name, generic_name, barcode, category_id, supplier_id, manufacturer,
            description, uses, indications, contraindications, warnings, side_effects,
            drug_interactions, storage_conditions, pregnancy_category, breastfeeding_info,
            adult_dosage, child_dosage, overdose_info, missed_dose_info, strength, dosage_form,
            unit, purchase_price, selling_price, quantity, min_stock_level, batch_number,
            expiry_date, requires_prescription, is_featured, status
        } = req.body;
        const image = req.file ? (req.file.path || `/uploads/medicines/${req.file.filename}`) : null;
        console.log('📸 POST /medicines:', { hasFile: !!req.file, image: image ? image.substring(0, 100) : null });
        // Convert empty barcode to null to avoid UNIQUE constraint violations
        const barcodeVal = barcode && barcode.trim() ? barcode.trim() : null;
        const [result] = await pool.execute(`
      INSERT INTO medicines (name, brand_name, generic_name, barcode, category_id, supplier_id,
        manufacturer, description, uses, indications, contraindications, warnings, side_effects,
        drug_interactions, storage_conditions, pregnancy_category, breastfeeding_info, adult_dosage,
        child_dosage, overdose_info, missed_dose_info, strength, dosage_form, unit,
        purchase_price, selling_price, quantity, min_stock_level, batch_number, expiry_date,
        image, requires_prescription, is_featured, status, is_active)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,1)`,
            [name, brand_name || null, generic_name || null, barcodeVal, category_id || null, supplier_id || null,
                manufacturer || null, description || null, uses || null, indications || null, contraindications || null,
                warnings || null, side_effects || null, drug_interactions || null, storage_conditions || null,
                pregnancy_category || 'N', breastfeeding_info || null,
                adult_dosage || null, child_dosage || null, overdose_info || null, missed_dose_info || null,
                strength || null, dosage_form || 'Tablet',
                unit || 'Tablet', purchase_price || 0, selling_price || 0, quantity || 0, min_stock_level || 10,
                batch_number || null, expiry_date || null, image,
                requires_prescription === 'true' || requires_prescription === true ? 1 : 0,
                is_featured === 'true' || is_featured === true ? 1 : 0,
                status || 'available'
            ]
        );
        // Log inventory
        if (parseInt(quantity) > 0) {
            await pool.execute(
                'INSERT INTO inventory_transactions (medicine_id, transaction_type, quantity, balance_before, balance_after, reason, created_by) VALUES (?,?,?,?,?,?,?)',
                [result.insertId, 'stock_in', quantity, 0, quantity, 'Initial stock', req.user.id]
            );
        }
        res.status(201).json({ success: true, message: 'Medicine added successfully.', id: result.insertId });
    } catch (error) {
        console.error('POST /medicines error:', error);
        res.status(500).json({ success: false, message: error.code === 'ER_DUP_ENTRY' ? 'A medicine with this barcode already exists.' : 'Server error.', error: error.message });
    }
});

// PUT /api/medicines/:id
router.put('/:id', authenticate, authorize('admin', 'pharmacist'), upload('medicines').single('image'), async (req, res) => {
    try {
        const { id } = req.params;
        const [existing] = await pool.execute('SELECT * FROM medicines WHERE id = ?', [id]);
        if (!existing.length) return res.status(404).json({ success: false, message: 'Medicine not found.' });
        const fields = req.body;
        // Cloudinary gives req.file.path (full https:// URL); local disk gives req.file.filename
        const image = req.file ? (req.file.path || `/uploads/medicines/${req.file.filename}`) : existing[0].image;
        // Convert empty barcode to null to avoid UNIQUE constraint violations
        const barcodeVal = fields.barcode && fields.barcode.trim() ? fields.barcode.trim() : null;
        await pool.execute(`
      UPDATE medicines SET name=?, brand_name=?, generic_name=?, barcode=?, category_id=?,
        supplier_id=?, manufacturer=?, description=?, uses=?, indications=?, contraindications=?,
        warnings=?, side_effects=?, drug_interactions=?, storage_conditions=?, pregnancy_category=?,
        breastfeeding_info=?, adult_dosage=?, child_dosage=?, overdose_info=?, missed_dose_info=?,
        strength=?, dosage_form=?, unit=?, purchase_price=?, selling_price=?, min_stock_level=?,
        batch_number=?, expiry_date=?, image=?, requires_prescription=?, is_featured=?, status=?
      WHERE id=?`,
            [fields.name, fields.brand_name || null, fields.generic_name || null, barcodeVal,
            fields.category_id || null, fields.supplier_id || null, fields.manufacturer || null,
            fields.description || null, fields.uses || null, fields.indications || null, fields.contraindications || null,
            fields.warnings || null, fields.side_effects || null, fields.drug_interactions || null, fields.storage_conditions || null,
            fields.pregnancy_category || 'N', fields.breastfeeding_info || null, fields.adult_dosage || null,
            fields.child_dosage || null, fields.overdose_info || null, fields.missed_dose_info || null, fields.strength || null,
            fields.dosage_form || 'Tablet', fields.unit || 'Tablet', fields.purchase_price || 0, fields.selling_price || 0,
            fields.min_stock_level || 10, fields.batch_number || null, fields.expiry_date || null, image,
            fields.requires_prescription === 'true' || fields.requires_prescription === true ? 1 : 0,
            fields.is_featured === 'true' || fields.is_featured === true ? 1 : 0,
            fields.status || 'available', id
            ]
        );
        res.json({ success: true, message: 'Medicine updated successfully.' });
    } catch (error) {
        console.error('PUT /medicines/:id error:', error);
        res.status(500).json({ success: false, message: error.code === 'ER_DUP_ENTRY' ? 'A medicine with this barcode already exists.' : 'Server error.', error: error.message });
    }
});

// DELETE /api/medicines/:id
router.delete('/:id', authenticate, authorize('admin'), async (req, res) => {
    try {
        await pool.execute('UPDATE medicines SET is_active = 0, status = ? WHERE id = ?', ['discontinued', req.params.id]);
        res.json({ success: true, message: 'Medicine deactivated.' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error.' });
    }
});

// POST /api/medicines/import
router.post('/import', authenticate, authorize('admin', 'pharmacist'), async (req, res) => {
    const conn = await pool.getConnection();
    await conn.beginTransaction();
    try {
        const { medicines } = req.body;
        if (!medicines || !Array.isArray(medicines)) {
            return res.status(400).json({ success: false, message: 'Invalid data format.' });
        }

        let count = 0;
        for (const item of medicines) {
            // Flexible property names to handle various Excel headers
            const name = item.name || item.Name || item.NAME;
            if (!name) continue;

            const brand_name = item.brand_name || item.Brand || item.brand || '';
            const generic_name = item.generic_name || item.Generic || item.generic || '';
            const barcode = item.barcode || item.Barcode || '';

            // Allow string parsing and fallback for prices and quantities
            const selling_price = parseFloat(item.selling_price || item.Price || item.price || 0) || 0;
            const purchase_price = parseFloat(item.purchase_price || item.Cost || item.cost || 0) || 0;
            const quantity = parseInt(item.quantity || item.Quantity || item.Stock || item.stock || 0, 10) || 0;
            const min_stock_level = parseInt(item.min_stock_level || item.MinStock || 10, 10) || 10;

            const supplier_id = item.supplier_id || null;
            const category_id = item.category_id || null;
            const description = item.description || item.Description || '';
            const strength = item.strength || item.Strength || '';
            const dosage_form = item.dosage_form || item.form || item.Form || 'Tablet';
            const unit = item.unit || item.Unit || 'Piece';

            const [result] = await conn.execute(`
              INSERT INTO medicines (name, brand_name, generic_name, barcode, purchase_price, selling_price, quantity, min_stock_level, category_id, supplier_id, description, strength, dosage_form, unit, status, is_active, is_featured)
              VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,1)
            `, [name, brand_name, generic_name, barcode, purchase_price, selling_price, quantity, min_stock_level, category_id, supplier_id, description, strength, dosage_form, unit, 'available', 1]);

            if (quantity > 0) {
                await conn.execute(
                    'INSERT INTO inventory_transactions (medicine_id, transaction_type, quantity, balance_before, balance_after, reason, created_by) VALUES (?,?,?,?,?,?,?)',
                    [result.insertId, 'stock_in', quantity, 0, quantity, 'Excel Bulk Import', req.user.id]
                );
            }
            count++;
        }
        await conn.commit();
        res.json({ success: true, message: 'Import successful', count });
    } catch (error) {
        await conn.rollback();
        console.error('Import error:', error);
        res.status(500).json({ success: false, message: 'Server error during import.', error: error.message });
    } finally {
        conn.release();
    }
});

module.exports = router;
