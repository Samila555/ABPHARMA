const { pool } = require('./config/database');

async function seedSuppliers() {
    const suppliers = [
        ['Emzor Pharmaceutical', 'John Emeka', 'info@emzor.com', '+234 802 000 1001', '12 Industrial Layout, Isolo', 'Lagos', 'Nigeria', 'Net 30', 1, 'Major local manufacturer'],
        ['May & Baker Nigeria', 'Amara Obi', 'sales@maybaker.com', '+234 803 000 2002', '3-5 Sapara Street, Ikeja', 'Lagos', 'Nigeria', 'Net 45', 1, 'Pharmaceutical manufacturer'],
        ['Pfizer Nigeria Ltd', 'Sarah Ahmed', 'nigeria@pfizer.com', '+234 804 000 3003', '27 Adeola Odeku, Victoria Island', 'Lagos', 'Nigeria', 'Net 60', 1, 'International pharma giant'],
        ['GlaxoSmithKline Nigeria', 'Chidi Nwosu', 'nigeria@gsk.com', '+234 805 000 4004', '1 Industrial Avenue, Ilupeju', 'Lagos', 'Nigeria', 'Net 45', 1, 'GSK local operations'],
        ['Fidson Healthcare', 'Bola Adeyemi', 'info@fidson.com', '+234 806 000 5005', 'Km 38, Lagos-Abeokuta Expressway', 'Ogun', 'Nigeria', 'Net 30', 1, 'Nigerian pharma company'],
        ['Swipha Nigeria', 'Grace Uzor', 'info@swipha.com', '+234 807 000 6006', 'Km 32, Badagry Expressway, Agbara', 'Ogun', 'Nigeria', 'Net 30', 1, 'Pharmaceutical importer & marketer'],
        ['Dana Pharmaceuticals', 'Mike Dike', 'sales@dana.com', '+234 808 000 7007', '52 Modupe Johnson Close, Ikeja', 'Lagos', 'Nigeria', 'Net 30', 1, 'Local distributor'],
        ['Roche Nigeria', 'Fatima Bello', 'nigeria@roche.com', '+234 809 000 8008', '4 Kofo Abayomi Street, Victoria Island', 'Lagos', 'Nigeria', 'Net 60', 1, 'Swiss multinational healthcare'],
        ['Novartis Nigeria', 'David Okafor', 'nigeria@novartis.com', '+234 810 000 9009', '2A Ligali Ayorinde, Victoria Island', 'Lagos', 'Nigeria', 'Net 60', 1, 'Global healthcare company'],
        ['Chi Pharma', 'Ngozi Eze', 'info@chipharma.com', '+234 811 001 0010', '15 Creek Road, Apapa', 'Lagos', 'Nigeria', 'Net 30', 1, 'Local pharma distributor'],
    ];

    try {
        for (const s of suppliers) {
            await pool.execute(
                'INSERT IGNORE INTO suppliers (name, contact_person, email, phone, address, city, country, payment_terms, is_active, notes) VALUES (?,?,?,?,?,?,?,?,?,?)',
                s
            );
        }
        console.log('✅ ' + suppliers.length + ' suppliers seeded successfully!');
    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        process.exit(0);
    }
}

seedSuppliers();
