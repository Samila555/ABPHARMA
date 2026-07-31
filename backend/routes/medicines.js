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
        const { search, category_id, status, low_stock, expiring_soon, visibility, page = 1, limit = 20 } = req.query;
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
        if (visibility === 'featured') { query += ` AND m.is_featured = 1`; }
        if (visibility === 'hidden') { query += ` AND m.is_featured = 0`; }
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
        const image = req.file ? req.file.path : null;
        console.log('📸 POST /medicines:', { hasFile: !!req.file, image: image ? image.substring(0, 100) : null });
        // Convert empty barcode to null to avoid UNIQUE constraint violations
        const barcodeVal = barcode && barcode.trim() ? barcode.trim() : null;
        const [result] = await pool.query(`
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
        const image = req.file ? req.file.path : existing[0].image;
        // Convert empty barcode to null to avoid UNIQUE constraint violations
        const barcodeVal = fields.barcode && fields.barcode.trim() ? fields.barcode.trim() : null;
        await pool.query(`
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

// PATCH /api/medicines/:id/feature (Quick toggle for customer dashboard visibility)
router.patch('/:id/feature', authenticate, authorize('admin'), async (req, res) => {
    try {
        const { is_featured } = req.body;
        await pool.query('UPDATE medicines SET is_featured = ? WHERE id = ?', [is_featured ? 1 : 0, req.params.id]);
        res.json({ success: true, message: `Visibility updated to ${is_featured ? 'Visible' : 'Hidden'}` });
    } catch (error) {
        console.error('PATCH /medicines/:id/feature error:', error);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
});

// DELETE /api/medicines/:id (hard delete — completely removes from database)
router.delete('/:id', authenticate, authorize('admin'), async (req, res) => {
    try {
        const [existing] = await pool.query('SELECT id, name, image FROM medicines WHERE id = ?', [req.params.id]);
        if (!existing.length) return res.status(404).json({ success: false, message: 'Medicine not found.' });

        const medicineId = req.params.id;

        // Delete related records first ( FK constraints may handle some, but be explicit)
        await pool.query('DELETE FROM inventory_transactions WHERE medicine_id = ?', [medicineId]);
        await pool.query('UPDATE order_items SET medicine_id = NULL WHERE medicine_id = ?', [medicineId]);
        await pool.query('UPDATE purchase_order_items SET medicine_id = NULL WHERE medicine_id = ?', [medicineId]);
        await pool.query('UPDATE offers SET medicine_id = NULL WHERE medicine_id = ?', [medicineId]);

        // Hard delete the medicine
        await pool.query('DELETE FROM medicines WHERE id = ?', [medicineId]);

        res.json({ success: true, message: `"${existing[0].name}" has been permanently deleted.` });
    } catch (error) {
        console.error('DELETE /medicines/:id error:', error);
        res.status(500).json({ success: false, message: 'Server error.', error: error.message });
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

        // Build category lookup: name → id (and slug for auto-create)
        const [cats] = await conn.query('SELECT id, name, slug FROM categories');
        const catByName = {};
        cats.forEach(c => { catByName[c.name.toLowerCase()] = c.id; });

        // Build supplier lookup: name → id
        const [sups] = await conn.query('SELECT id, name FROM suppliers');
        const supByName = {};
        sups.forEach(s => { supByName[s.name.toLowerCase()] = s.id; });

        let count = 0;
        const errors = [];
        for (const rawItem of medicines) {
            // Normalize keys to handle spaces, different cases, and formatting issues
            const item = {};
            for (const key in rawItem) {
                const cleanKey = key.trim().toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
                item[cleanKey] = rawItem[key];
            }

            const name = item.name || item.medicine_name || item.medicine || item.product_name || item.product || rawItem.name || rawItem.Name || rawItem.NAME;
            if (!name || String(name).trim() === '') {
                if (Object.keys(rawItem).length > 0) {
                    errors.push({ name: 'Unknown Row', error: 'Missing medicine name column' });
                }
                continue;
            }

            const brand_name = item.brand_name || item.brand || rawItem.brand_name || rawItem.Brand || '';
            const generic_name = item.generic_name || item.generic || rawItem.generic_name || rawItem.Generic || '';
            const barcode = item.barcode || item.codigo || rawItem.barcode || rawItem.Barcode || '';
            const selling_price = parseFloat(item.selling_price || item.price || item.retail_price || rawItem.selling_price || rawItem.Price || 0) || 0;
            const purchase_price = parseFloat(item.purchase_price || item.cost || item.cost_price || rawItem.purchase_price || rawItem.Cost || 0) || 0;
            const quantity = parseInt(item.quantity || item.qty || item.stock || item.inventory || rawItem.quantity || rawItem.Quantity || 0, 10) || 0;
            const min_stock_level = parseInt(item.min_stock_level || item.min_stock || item.reorder_level || rawItem.min_stock_level || rawItem.MinStock || 10, 10) || 10;
            const description = item.description || item.desc || rawItem.description || rawItem.Description || '';
            const strength = item.strength || item.potency || rawItem.strength || rawItem.Strength || '';
            const dosage_form = item.dosage_form || item.form || item.dosage || rawItem.dosage_form || rawItem.Form || 'Tablet';
            const unit = item.unit || item.uom || rawItem.unit || rawItem.Unit || 'Piece';
            const image = item.image || item.image_url || item.picture || item.photo || rawItem.image || rawItem.Image || '';

            // Resolve category: accept numeric ID or category name
            let category_id = null;
            const catRaw = item.category_id || item.category || item.category_name || rawItem.category_id || rawItem.Category;
            if (catRaw !== undefined && catRaw !== null && catRaw !== '') {
                const catStr = String(catRaw).trim();
                if (/^\d+$/.test(catStr)) {
                    // It is strictly a number, treat as ID
                    category_id = parseInt(catStr, 10);
                } else {
                    // It's a category name — look up or auto-create
                    const catKey = String(catRaw).trim().toLowerCase();
                    if (catByName[catKey]) {
                        category_id = catByName[catKey];
                    } else {
                        const slug = catKey.replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
                        const [newCat] = await conn.execute(
                            'INSERT INTO categories (name, slug, description) VALUES (?, ?, ?)',
                            [catRaw.trim(), slug, `Auto-created from import`]
                        );
                        category_id = newCat.insertId;
                        catByName[catKey] = category_id;
                    }
                }
            }

            // Resolve supplier: accept numeric ID or supplier name
            let supplier_id = null;
            const supRaw = item.supplier_id || item.supplier || item.supplier_name || rawItem.supplier_id || rawItem.Supplier;
            if (supRaw !== undefined && supRaw !== null && supRaw !== '') {
                const supStr = String(supRaw).trim();
                if (/^\d+$/.test(supStr)) {
                    // It is strictly a number, treat as ID
                    supplier_id = parseInt(supStr, 10);
                } else {
                    const supKey = String(supRaw).trim().toLowerCase();
                    if (supByName[supKey]) {
                        supplier_id = supByName[supKey];
                    } else {
                        const [newSup] = await conn.execute(
                            'INSERT INTO suppliers (name, country) VALUES (?, ?)',
                            [supRaw.trim(), 'Ethiopia']
                        );
                        supplier_id = newSup.insertId;
                        supByName[supKey] = supplier_id;
                    }
                }
            }

            try {
                const [result] = await conn.execute(`
                    INSERT INTO medicines (name, brand_name, generic_name, barcode, purchase_price, selling_price, quantity, min_stock_level, category_id, supplier_id, description, strength, dosage_form, unit, image, status, is_active, is_featured)
                    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,0)
                `, [name, brand_name || null, generic_name || null, barcode || null, purchase_price, selling_price, quantity, min_stock_level, category_id, supplier_id, description || null, strength || null, dosage_form, unit, image || null, 'available', 1]);

                if (quantity > 0) {
                    await conn.execute(
                        'INSERT INTO inventory_transactions (medicine_id, transaction_type, quantity, balance_before, balance_after, reason, created_by) VALUES (?,?,?,?,?,?,?)',
                        [result.insertId, 'stock_in', quantity, 0, quantity, 'Excel Bulk Import', req.user.id]
                    );
                }
                count++;
            } catch (rowErr) {
                errors.push({ name, error: rowErr.message });
            }
        }
        await conn.commit();
        res.json({ success: true, message: 'Import successful', count, errors: errors.length ? errors : undefined });
    } catch (error) {
        await conn.rollback();
        console.error('Import error:', error);
        res.status(500).json({ success: false, message: 'Server error during import.', error: error.message });
    } finally {
        conn.release();
    }
});

module.exports = router;
