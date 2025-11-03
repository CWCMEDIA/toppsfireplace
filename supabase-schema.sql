-- Tops Fireplaces E-commerce Database Schema
-- This file contains the SQL schema for setting up the Supabase database

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table for admin authentication
CREATE TABLE users (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'customer' CHECK (role IN ('admin', 'customer')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create products table
CREATE TABLE products (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  long_description TEXT,
  price DECIMAL(10,2) NOT NULL,
  original_price DECIMAL(10,2),
  category VARCHAR(100) NOT NULL,
  subcategory VARCHAR(100),
  material VARCHAR(100) NOT NULL,
  fuel_type VARCHAR(50) NOT NULL,
  dimensions VARCHAR(100),
  weight VARCHAR(50),
  features TEXT[], -- Array of features
  specifications JSONB, -- JSON object for specifications
  images TEXT[], -- Array of image URLs
  badge VARCHAR(50),
  rating DECIMAL(3,2) DEFAULT 0.00,
  review_count INTEGER DEFAULT 0,
  stock_count INTEGER DEFAULT 0,
  in_stock BOOLEAN DEFAULT false,
  featured BOOLEAN DEFAULT false,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create orders table
CREATE TABLE orders (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  order_number VARCHAR(50) UNIQUE NOT NULL,
  customer_email VARCHAR(255) NOT NULL,
  customer_name VARCHAR(255) NOT NULL,
  customer_phone VARCHAR(20),
  shipping_address JSONB NOT NULL,
  billing_address JSONB,
  subtotal DECIMAL(10,2) NOT NULL,
  tax_amount DECIMAL(10,2) DEFAULT 0.00,
  shipping_amount DECIMAL(10,2) DEFAULT 0.00,
  discount_amount DECIMAL(10,2) DEFAULT 0.00,
  total_amount DECIMAL(10,2) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled')),
  payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
  payment_method VARCHAR(50),
  stripe_payment_intent_id VARCHAR(255),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create order_items table
CREATE TABLE order_items (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create contact_enquiries table
CREATE TABLE contact_enquiries (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  subject VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  enquiry_type VARCHAR(50) DEFAULT 'general' CHECK (enquiry_type IN ('general', 'quote', 'installation', 'maintenance', 'showroom')),
  status VARCHAR(20) DEFAULT 'new' CHECK (status IN ('new', 'in_progress', 'resolved')),
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_status ON products(status);
CREATE INDEX idx_products_in_stock ON products(in_stock);
CREATE INDEX idx_orders_customer_email ON orders(customer_email);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_product_id ON order_items(product_id);
CREATE INDEX idx_contact_enquiries_status ON contact_enquiries(status);
CREATE INDEX idx_contact_enquiries_created_at ON contact_enquiries(created_at);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_contact_enquiries_updated_at BEFORE UPDATE ON contact_enquiries FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create storage bucket for product images
INSERT INTO storage.buckets (id, name, public) VALUES ('product-images', 'product-images', true);

-- Set up Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_enquiries ENABLE ROW LEVEL SECURITY;

-- Create policies for public access to products
CREATE POLICY "Products are viewable by everyone" ON products FOR SELECT USING (true);

-- Create policies for admin access
CREATE POLICY "Admins can manage products" ON products FOR ALL USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid() 
    AND users.role = 'admin'
  )
);

CREATE POLICY "Admins can manage orders" ON orders FOR ALL USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid() 
    AND users.role = 'admin'
  )
);

CREATE POLICY "Admins can manage contact enquiries" ON contact_enquiries FOR ALL USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid() 
    AND users.role = 'admin'
  )
);

-- Create policies for customers to view their own orders
CREATE POLICY "Customers can view their own orders" ON orders FOR SELECT USING (
  customer_email = auth.email()
);

-- Insert default admin user
-- NOTE: Generate your own password hash for production!
-- Use: SELECT crypt('your-password-here', gen_salt('bf', 12));
-- Or use bcrypt in Node.js: bcrypt.hashSync('your-password', 12)
-- IMPORTANT: Change the default password in production!
INSERT INTO users (email, password_hash, role) VALUES (
  'admin@topsfireplaces.com',
  '$2a$12$REPLACE_WITH_YOUR_OWN_HASH_HERE', -- Replace with your own bcrypt hash
  'admin'
);

-- Insert sample orders for testing
INSERT INTO orders (order_number, customer_email, customer_name, customer_phone, shipping_address, subtotal, tax_amount, shipping_amount, total_amount, status, payment_status, payment_method, stripe_payment_intent_id) VALUES
('ORD-2024-001', 'customer1@example.com', 'John Smith', '01234567890', '{"street": "123 Main St", "city": "Southend", "postcode": "SS1 1AA", "country": "UK"}', 1299.00, 259.80, 50.00, 1608.80, 'delivered', 'paid', 'card', 'pi_test_123'),
('ORD-2024-002', 'customer2@example.com', 'Jane Doe', '01234567891', '{"street": "456 High St", "city": "Chelmsford", "postcode": "CM1 1BB", "country": "UK"}', 899.00, 179.80, 50.00, 1128.80, 'processing', 'paid', 'card', 'pi_test_456'),
('ORD-2024-003', 'customer3@example.com', 'Bob Johnson', '01234567892', '{"street": "789 Park Ave", "city": "Colchester", "postcode": "CO1 1CC", "country": "UK"}', 1899.00, 379.80, 50.00, 2328.80, 'shipped', 'paid', 'card', 'pi_test_789');

-- Insert sample products
INSERT INTO products (name, description, long_description, price, original_price, category, subcategory, material, fuel_type, dimensions, weight, features, specifications, images, badge, stock_count, in_stock, featured, status) VALUES 
(
  'Classic Limestone Fireplace',
  'A timeless limestone fireplace that brings elegance to any home.',
  'This beautiful limestone fireplace features traditional craftsmanship and modern efficiency. Perfect for both traditional and contemporary homes, it provides excellent heat output while maintaining the classic aesthetic that limestone is known for.',
  1299.00,
  1599.00,
  'limestone',
  'fireplace',
  'limestone',
  'gas',
  '1200mm x 600mm x 300mm',
  '150kg',
  ARRAY['Traditional design', 'High efficiency', 'Easy installation', 'Durable construction'],
  '{"Heat Output": "5kW", "Efficiency": "85%", "Warranty": "2 years"}',
  ARRAY['/images/products/limestone-fireplace-1.jpg', '/images/products/limestone-fireplace-2.jpg'],
  'Best Seller',
  5,
  true,
  true,
  'active'
),
(
  'Modern Marble Electric Fire',
  'Contemporary electric fire with stunning marble finish.',
  'This sleek electric fire combines the beauty of marble with modern technology. Features realistic flame effects, remote control, and energy-efficient LED lighting.',
  899.00,
  1099.00,
  'marble',
  'electric',
  'marble',
  'electric',
  '1000mm x 500mm x 200mm',
  '80kg',
  ARRAY['Remote control', 'LED flame effects', 'Energy efficient', 'Easy maintenance'],
  '{"Power": "2kW", "Flame Effects": "LED", "Remote": "Yes", "Warranty": "3 years"}',
  ARRAY['/images/products/marble-electric-1.jpg', '/images/products/marble-electric-2.jpg'],
  'New',
  8,
  true,
  true,
  'active'
),
(
  'Rustic Granite Wood Stove',
  'Heavy-duty granite wood stove for traditional heating.',
  'Built to last, this granite wood stove provides excellent heat retention and a beautiful rustic appearance. Perfect for country homes and those who prefer traditional heating methods.',
  1899.00,
  2199.00,
  'granite',
  'stove',
  'granite',
  'wood',
  '800mm x 600mm x 400mm',
  '200kg',
  ARRAY['High heat retention', 'Rustic appearance', 'Large firebox', 'Durable granite'],
  '{"Heat Output": "8kW", "Firebox Size": "Large", "Material": "Solid granite", "Warranty": "5 years"}',
  ARRAY['/images/products/granite-stove-1.jpg', '/images/products/granite-stove-2.jpg'],
  'Premium',
  3,
  true,
  false,
  'active'
);
