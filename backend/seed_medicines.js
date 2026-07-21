const mysql = require('mysql2/promise');
require('dotenv').config();

const sampleMedicines = [
    { name: 'Paracetamol 500mg', generic: 'Acetaminophen', category: 'Pain Relief', price: 500, stock: 1500 },
    { name: 'Ibuprofen 400mg', generic: 'Ibuprofen', category: 'Pain Relief', price: 800, stock: 900 },
    { name: 'Amoxicillin 500mg', generic: 'Amoxicillin', category: 'Prescription Medicines', price: 1200, stock: 450 },
    { name: 'Vitamin C 1000mg', generic: 'Ascorbic Acid', category: 'Vitamins & Supplements', price: 3500, stock: 200 },
    { name: 'Cetirizine 10mg', generic: 'Cetirizine HCl', category: 'OTC Medicines', price: 600, stock: 800 },
    { name: 'Omeprazole 20mg', generic: 'Omeprazole', category: 'Prescription Medicines', price: 1500, stock: 350 },
    { name: 'Metformin 500mg', generic: 'Metformin Hydrochloride', category: 'Diabetes Care', price: 850, stock: 600 },
    { name: 'Amlodipine 5mg', generic: 'Amlodipine Besylate', category: 'Heart Medicines', price: 1100, stock: 400 },
    { name: 'Loratadine 10mg', generic: 'Loratadine', category: 'OTC Medicines', price: 750, stock: 1100 },
    { name: 'Azithromycin 500mg', generic: 'Azithromycin', category: 'Prescription Medicines', price: 2500, stock: 200 },
    { name: 'Baby Wipes (Aloe Vera)', generic: 'Baby Care', category: 'Baby Care', price: 1500, stock: 150 },
    { name: 'Diaper Rash Cream', generic: 'Zinc Oxide', category: 'Baby Care', price: 2200, stock: 100 },
    { name: 'Digital Thermometer', generic: 'Medical Device', category: 'Medical Equipment', price: 3000, stock: 80 },
    { name: 'Blood Pressure Monitor', generic: 'BP Machine', category: 'Medical Equipment', price: 15000, stock: 25 },
    { name: 'Glucometer Kit', generic: 'Glucose testing', category: 'Diabetes Care', price: 12000, stock: 40 },
    { name: 'Antiseptic Liquid 500ml', generic: 'Chlorhexidine', category: 'First Aid', price: 2500, stock: 300 },
    { name: 'Band-Aid Pack (100s)', generic: 'Adhesive Bandages', category: 'First Aid', price: 1200, stock: 250 },
    { name: 'Aspirin 75mg', generic: 'Acetylsalicylic acid', category: 'Heart Medicines', price: 400, stock: 1000 },
    { name: 'Folic Acid 5mg', generic: 'Folic Acid', category: 'Women Health', price: 500, stock: 600 },
    { name: 'Pregnancy Test Kit', generic: 'HCG Test', category: 'Women Health', price: 800, stock: 300 },
    { name: 'Multivitamin for Men', generic: 'Multivitamins', category: 'Men Health', price: 4500, stock: 100 },
    { name: 'Eye drops (Lubricant)', generic: 'Artificial Tears', category: 'Eye Care', price: 1800, stock: 150 },
    { name: 'Ear drops (Wax removal)', generic: 'Carbamide Peroxide', category: 'Ear Care', price: 2100, stock: 90 },
    { name: 'Fluoride Toothpaste', generic: 'Dental Paste', category: 'Dental Care', price: 1200, stock: 400 },
    { name: 'Children Cough Syrup', generic: 'Guaifenesin', category: 'Children Medicines', price: 1600, stock: 200 },
    { name: 'Ginger & Garlic Extract', generic: 'Herbal Supplement', category: 'Herbal Medicines', price: 2500, stock: 120 },
    { name: 'Aloe Vera Gel', generic: 'Skin Care', category: 'Skin Care', price: 1800, stock: 200 },
    { name: 'Sunscreen SPF 50', generic: 'Sunblock', category: 'Skin Care', price: 3500, stock: 150 },
];

async function seedMedicines() {
    try {
        const conn = await mysql.createConnection({
            host: process.env.DB_HOST || '127.0.0.1',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'abpharma_db'
        });

        // Get categories mapped by name
        const [catRows] = await conn.execute('SELECT id, name FROM categories');
        const catMap = {};
        catRows.forEach(c => { catMap[c.name] = c.id; });

        let count = 0;
        for (const item of sampleMedicines) {
            const catId = catMap[item.category] || null;
            const barcode = 'BAC-' + Math.floor(Math.random() * 1000000000);

            await conn.execute(`
                INSERT INTO medicines (
                    name, generic_name, category_id, barcode, selling_price, purchase_price, 
                    quantity, min_stock_level, status, requires_prescription, is_featured, is_active
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
            `, [
                item.name, item.generic, catId, barcode, item.price, item.price * 0.7,
                item.stock, 20, 'available', item.category === 'Prescription Medicines' ? 1 : 0, 1
            ]);
            count++;
        }

        console.log(`✅ Successfully seeded ${count} medicines into the database!`);
        await conn.end();
        process.exit(0);
    } catch (err) {
        console.error('Failed to seed:', err);
        process.exit(1);
    }
}

seedMedicines();
