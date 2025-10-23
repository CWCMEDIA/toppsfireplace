-- Tops Fireplaces E-commerce Database Schema
-- This is a sample schema for future database implementation

-- Products table
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    long_description TEXT,
    price DECIMAL(10,2) NOT NULL,
    original_price DECIMAL(10,2),
    category VARCHAR(100) NOT NULL,
    subcategory VARCHAR(100),
    material VARCHAR(100),
    fuel_type VARCHAR(50),
    dimensions VARCHAR(100),
    weight VARCHAR(50),
    features JSONB,
    specifications JSONB,
    images JSONB,
    badge VARCHAR(50),
    rating DECIMAL(3,2) DEFAULT 0,
    review_count INTEGER DEFAULT 0,
    stock_count INTEGER DEFAULT 0,
    in_stock BOOLEAN DEFAULT true,
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Categories table
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    parent_id INTEGER REFERENCES categories(id),
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Users table (for admin and future customer accounts)
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) UNIQUE,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    phone VARCHAR(20),
    role VARCHAR(20) DEFAULT 'customer',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Orders table
CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    order_number VARCHAR(50) UNIQUE NOT NULL,
    user_id INTEGER REFERENCES users(id),
    customer_email VARCHAR(255) NOT NULL,
    customer_name VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(20),
    shipping_address JSONB NOT NULL,
    billing_address JSONB,
    subtotal DECIMAL(10,2) NOT NULL,
    tax_amount DECIMAL(10,2) DEFAULT 0,
    shipping_amount DECIMAL(10,2) DEFAULT 0,
    discount_amount DECIMAL(10,2) DEFAULT 0,
    total_amount DECIMAL(10,2) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    payment_status VARCHAR(20) DEFAULT 'pending',
    payment_method VARCHAR(50),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Order items table
CREATE TABLE order_items (
    id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
    product_id INTEGER REFERENCES products(id),
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Cart table (for guest users)
CREATE TABLE cart_items (
    id SERIAL PRIMARY KEY,
    session_id VARCHAR(255) NOT NULL,
    product_id INTEGER REFERENCES products(id),
    quantity INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Reviews table
CREATE TABLE reviews (
    id SERIAL PRIMARY KEY,
    product_id INTEGER REFERENCES products(id),
    user_id INTEGER REFERENCES users(id),
    customer_name VARCHAR(255) NOT NULL,
    customer_email VARCHAR(255),
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title VARCHAR(255),
    comment TEXT,
    is_verified BOOLEAN DEFAULT false,
    is_approved BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Contact enquiries table
CREATE TABLE contact_enquiries (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    subject VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    enquiry_type VARCHAR(50) DEFAULT 'general',
    status VARCHAR(20) DEFAULT 'new',
    admin_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Settings table (for site configuration)
CREATE TABLE settings (
    id SERIAL PRIMARY KEY,
    key VARCHAR(100) UNIQUE NOT NULL,
    value TEXT,
    description TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default admin user (password: admin123)
INSERT INTO users (username, email, password_hash, first_name, last_name, role) 
VALUES ('admin', 'admin@topsfireplaces.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Admin', 'User', 'admin');

-- Insert default categories
INSERT INTO categories (name, slug, description, sort_order) VALUES
('Limestone', 'limestone', 'Premium limestone fireplaces', 1),
('Marble', 'marble', 'Elegant marble fireplaces', 2),
('Granite', 'granite', 'Durable granite fireplaces', 3),
('Travertine', 'travertine', 'Natural travertine fireplaces', 4),
('Electric', 'electric', 'Modern electric fires', 5),
('Cast Iron', 'cast-iron', 'Traditional cast iron stoves', 6);

-- Insert sample products
INSERT INTO products (name, description, price, original_price, category, subcategory, material, fuel_type, dimensions, features, specifications, rating, review_count, stock_count) VALUES
('Classic Limestone Fireplace', 'A timeless limestone fireplace perfect for traditional homes.', 1299.00, 1599.00, 'limestone', 'fireplace', 'limestone', 'gas', '120cm x 80cm x 15cm', '["Gas powered", "Remote control", "LED lighting"]', '{"Material": "Premium Limestone", "Fuel Type": "Natural Gas", "Heat Output": "4.5kW"}', 4.8, 24, 5),
('Modern Marble Electric Fire', 'Contemporary marble electric fire with realistic flame effect.', 899.00, 1099.00, 'marble', 'electric', 'marble', 'electric', '100cm x 70cm x 12cm', '["Electric powered", "Realistic flames", "Energy efficient"]', '{"Material": "Premium Marble", "Fuel Type": "Electric", "Heat Output": "2kW"}', 4.9, 18, 8),
('Rustic Granite Wood Stove', 'Heavy-duty granite wood stove for efficient heating.', 1899.00, 2199.00, 'granite', 'stove', 'granite', 'wood', '60cm x 50cm x 40cm', '["Wood burning", "High efficiency", "Heat resistant"]', '{"Material": "Premium Granite", "Fuel Type": "Wood", "Heat Output": "8kW"}', 4.7, 31, 3);

-- Insert default settings
INSERT INTO settings (key, value, description) VALUES
('site_name', 'Tops Fireplaces', 'Website name'),
('contact_email', 'topsfireplaces@hotmail.com', 'Main contact email'),
('contact_phone', '01702 510222', 'Main contact phone'),
('free_delivery_threshold', '500', 'Minimum order amount for free delivery'),
('delivery_cost', '50', 'Standard delivery cost'),
('currency', 'GBP', 'Default currency'),
('tax_rate', '20', 'VAT rate percentage');
