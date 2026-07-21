-- AB Pharma Database Schema
-- Run this script to create all tables

CREATE DATABASE IF NOT EXISTS abpharma_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE abpharma_db;

-- Users / Admins Table
CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin','pharmacist','cashier','customer') DEFAULT 'customer',
    phone VARCHAR(20),
    address TEXT,
    avatar VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    two_factor_enabled BOOLEAN DEFAULT FALSE,
    two_factor_secret VARCHAR(255),
    last_login DATETIME,
    reset_token VARCHAR(255),
    reset_token_expires DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Categories Table
CREATE TABLE IF NOT EXISTS categories (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    image VARCHAR(255),
    parent_id INT,
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE SET NULL
);

-- Suppliers Table
CREATE TABLE IF NOT EXISTS suppliers (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    contact_person VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(20),
    address TEXT,
    city VARCHAR(100),
    country VARCHAR(100) DEFAULT 'Nigeria',
    payment_terms VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Medicines Table
CREATE TABLE IF NOT EXISTS medicines (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    brand_name VARCHAR(255),
    generic_name VARCHAR(255),
    barcode VARCHAR(100) UNIQUE,
    category_id INT,
    supplier_id INT,
    manufacturer VARCHAR(255),
    description TEXT,
    -- Drug Information
    uses TEXT,
    indications TEXT,
    contraindications TEXT,
    warnings TEXT,
    side_effects TEXT,
    drug_interactions TEXT,
    storage_conditions VARCHAR(255),
    pregnancy_category ENUM('A','B','C','D','X','N') DEFAULT 'N',
    breastfeeding_info TEXT,
    adult_dosage TEXT,
    child_dosage TEXT,
    overdose_info TEXT,
    missed_dose_info TEXT,
    -- Pricing & Stock
    strength VARCHAR(100),
    dosage_form VARCHAR(100),
    unit VARCHAR(50) DEFAULT 'Tablet',
    purchase_price DECIMAL(10,2) NOT NULL DEFAULT 0,
    selling_price DECIMAL(10,2) NOT NULL DEFAULT 0,
    quantity INT DEFAULT 0,
    min_stock_level INT DEFAULT 10,
    batch_number VARCHAR(100),
    expiry_date DATE,
    -- Media
    image VARCHAR(255),
    images JSON,
    -- Status
    requires_prescription BOOLEAN DEFAULT FALSE,
    is_featured BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    status ENUM('available','out_of_stock','discontinued') DEFAULT 'available',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
    FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE SET NULL
);

-- Customers Table
CREATE TABLE IF NOT EXISTS customers (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(20),
    date_of_birth DATE,
    gender ENUM('male','female','other'),
    address TEXT,
    city VARCHAR(100),
    membership_type ENUM('regular','silver','gold','platinum') DEFAULT 'regular',
    membership_expiry DATE,
    loyalty_points INT DEFAULT 0,
    total_purchases DECIMAL(12,2) DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Prescriptions Table
CREATE TABLE IF NOT EXISTS prescriptions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    customer_id INT,
    doctor_name VARCHAR(255),
    doctor_phone VARCHAR(20),
    hospital VARCHAR(255),
    prescription_date DATE,
    image VARCHAR(255),
    notes TEXT,
    status ENUM('pending','verified','dispensed','rejected') DEFAULT 'pending',
    verified_by INT,
    verified_at DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL,
    FOREIGN KEY (verified_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Orders Table
CREATE TABLE IF NOT EXISTS orders (
    id INT PRIMARY KEY AUTO_INCREMENT,
    order_number VARCHAR(50) UNIQUE NOT NULL,
    customer_id INT,
    customer_name VARCHAR(255),
    customer_phone VARCHAR(20),
    customer_email VARCHAR(255),
    order_type ENUM('pos','online','phone') DEFAULT 'pos',
    status ENUM('pending','confirmed','processing','ready','delivered','completed','cancelled','refunded') DEFAULT 'pending',
    payment_status ENUM('pending','paid','partial','refunded') DEFAULT 'pending',
    payment_method ENUM('cash','card','transfer','mobile_money') DEFAULT 'cash',
    subtotal DECIMAL(12,2) DEFAULT 0,
    discount DECIMAL(12,2) DEFAULT 0,
    discount_type ENUM('fixed','percentage') DEFAULT 'fixed',
    tax DECIMAL(12,2) DEFAULT 0,
    tax_rate DECIMAL(5,2) DEFAULT 0,
    total DECIMAL(12,2) DEFAULT 0,
    amount_paid DECIMAL(12,2) DEFAULT 0,
    change_amount DECIMAL(12,2) DEFAULT 0,
    delivery_address TEXT,
    delivery_type ENUM('pickup','delivery') DEFAULT 'pickup',
    delivery_fee DECIMAL(10,2) DEFAULT 0,
    prescription_id INT,
    notes TEXT,
    cashier_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL,
    FOREIGN KEY (prescription_id) REFERENCES prescriptions(id) ON DELETE SET NULL,
    FOREIGN KEY (cashier_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Order Items Table
CREATE TABLE IF NOT EXISTS order_items (
    id INT PRIMARY KEY AUTO_INCREMENT,
    order_id INT NOT NULL,
    medicine_id INT,
    medicine_name VARCHAR(255) NOT NULL,
    barcode VARCHAR(100),
    batch_number VARCHAR(100),
    quantity INT NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    discount DECIMAL(10,2) DEFAULT 0,
    total DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (medicine_id) REFERENCES medicines(id) ON DELETE SET NULL
);

-- Purchase Orders Table
CREATE TABLE IF NOT EXISTS purchase_orders (
    id INT PRIMARY KEY AUTO_INCREMENT,
    po_number VARCHAR(50) UNIQUE NOT NULL,
    supplier_id INT,
    status ENUM('draft','sent','partial','received','cancelled') DEFAULT 'draft',
    payment_status ENUM('pending','partial','paid') DEFAULT 'pending',
    subtotal DECIMAL(12,2) DEFAULT 0,
    tax DECIMAL(12,2) DEFAULT 0,
    total DECIMAL(12,2) DEFAULT 0,
    amount_paid DECIMAL(12,2) DEFAULT 0,
    invoice_number VARCHAR(100),
    invoice_image VARCHAR(255),
    expected_date DATE,
    received_date DATE,
    notes TEXT,
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE SET NULL,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Purchase Order Items Table
CREATE TABLE IF NOT EXISTS purchase_order_items (
    id INT PRIMARY KEY AUTO_INCREMENT,
    purchase_order_id INT NOT NULL,
    medicine_id INT,
    medicine_name VARCHAR(255) NOT NULL,
    quantity_ordered INT NOT NULL,
    quantity_received INT DEFAULT 0,
    unit_cost DECIMAL(10,2) NOT NULL,
    total DECIMAL(10,2) NOT NULL,
    batch_number VARCHAR(100),
    expiry_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (purchase_order_id) REFERENCES purchase_orders(id) ON DELETE CASCADE,
    FOREIGN KEY (medicine_id) REFERENCES medicines(id) ON DELETE SET NULL
);

-- Inventory Transactions Table
CREATE TABLE IF NOT EXISTS inventory_transactions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    medicine_id INT NOT NULL,
    transaction_type ENUM('stock_in','stock_out','transfer','return','damage','adjustment','expired') NOT NULL,
    quantity INT NOT NULL,
    balance_before INT,
    balance_after INT,
    reference_type VARCHAR(50),
    reference_id INT,
    batch_number VARCHAR(100),
    expiry_date DATE,
    reason TEXT,
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (medicine_id) REFERENCES medicines(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Cash Flow Table
CREATE TABLE IF NOT EXISTS cash_flow (
    id INT PRIMARY KEY AUTO_INCREMENT,
    type ENUM('income','expense') NOT NULL,
    category VARCHAR(100),
    description TEXT,
    amount DECIMAL(12,2) NOT NULL,
    payment_method ENUM('cash','card','transfer','mobile_money') DEFAULT 'cash',
    reference_type VARCHAR(50),
    reference_id INT,
    date DATE NOT NULL,
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type ENUM('info','warning','danger','success') DEFAULT 'info',
    category VARCHAR(100),
    is_read BOOLEAN DEFAULT FALSE,
    link VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Activity Logs Table
CREATE TABLE IF NOT EXISTS activity_logs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    action VARCHAR(255) NOT NULL,
    module VARCHAR(100),
    description TEXT,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- QR Scans Table
CREATE TABLE IF NOT EXISTS qr_scans (
    id INT PRIMARY KEY AUTO_INCREMENT,
    qr_code_id VARCHAR(100),
    device_type VARCHAR(100),
    browser VARCHAR(100),
    os VARCHAR(100),
    country VARCHAR(100),
    city VARCHAR(100),
    ip_address VARCHAR(45),
    scanned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Website CMS Table
CREATE TABLE IF NOT EXISTS cms_content (
    id INT PRIMARY KEY AUTO_INCREMENT,
    section VARCHAR(100) UNIQUE NOT NULL,
    title VARCHAR(255),
    content TEXT,
    data JSON,
    image VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    updated_by INT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Banners Table
CREATE TABLE IF NOT EXISTS banners (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255),
    subtitle TEXT,
    image VARCHAR(255),
    button_text VARCHAR(100),
    button_link VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Offers Table
CREATE TABLE IF NOT EXISTS offers (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    discount_type ENUM('fixed','percentage') DEFAULT 'percentage',
    discount_value DECIMAL(10,2),
    medicine_id INT,
    category_id INT,
    start_date DATE,
    end_date DATE,
    image VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (medicine_id) REFERENCES medicines(id) ON DELETE SET NULL,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
);

-- Newsletter Table
CREATE TABLE IF NOT EXISTS newsletter (
    id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) UNIQUE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Contact Messages Table
CREATE TABLE IF NOT EXISTS contact_messages (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(20),
    subject VARCHAR(255),
    message TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    replied_at DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ======= INDEXES =======
CREATE INDEX idx_medicines_barcode ON medicines(barcode);
CREATE INDEX idx_medicines_category ON medicines(category_id);
CREATE INDEX idx_medicines_expiry ON medicines(expiry_date);
CREATE INDEX idx_medicines_quantity ON medicines(quantity);
CREATE INDEX idx_orders_number ON orders(order_number);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created ON orders(created_at);
CREATE INDEX idx_inventory_medicine ON inventory_transactions(medicine_id);
CREATE INDEX idx_cash_flow_date ON cash_flow(date);

-- ======= DEFAULT ADMIN USER =======
-- Password: Admin@1234 (bcrypt hashed)
INSERT INTO users (name, email, password, role) VALUES
('AB Pharma Admin', 'admin@abpharma.com', '$2a$10$xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx', 'admin');

-- ======= DEFAULT CATEGORIES =======
INSERT INTO categories (name, slug, description) VALUES
('Prescription Medicines', 'prescription-medicines', 'Medicines that require a prescription'),
('Vitamins & Supplements', 'vitamins-supplements', 'Vitamins, minerals, and dietary supplements'),
('Baby Care', 'baby-care', 'Products for infants and toddlers'),
('Skin Care', 'skin-care', 'Dermatological and cosmetic products'),
('Personal Care', 'personal-care', 'Personal hygiene and care products'),
('Medical Equipment', 'medical-equipment', 'Medical devices and equipment'),
('Diabetes Care', 'diabetes-care', 'Products for diabetes management'),
('Heart Medicines', 'heart-medicines', 'Cardiovascular medications'),
('Pain Relief', 'pain-relief', 'Analgesics and pain management'),
('First Aid', 'first-aid', 'First aid supplies and wound care'),
('Eye Care', 'eye-care', 'Ophthalmic products'),
('Ear Care', 'ear-care', 'Ear care products'),
('Dental Care', 'dental-care', 'Oral health products'),
('Women Health', 'womens-health', 'Products for women health'),
('Men Health', 'mens-health', 'Products for men health'),
('Children Medicines', 'childrens-medicines', 'Pediatric medications'),
('Herbal Medicines', 'herbal-medicines', 'Natural and herbal remedies'),
('OTC Medicines', 'otc-medicines', 'Over-the-counter medications');
