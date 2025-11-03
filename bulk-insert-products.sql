-- Bulk Insert Products for Tops Fireplaces
-- This script inserts multiple products into the Supabase database
-- Fill in the product details below and run in Supabase SQL Editor

-- Example format:
-- Replace the values below with your actual fireplace data
-- Images can be empty arrays [] for now - you'll add them manually later

INSERT INTO products (
  name,
  description,
  long_description,
  price,
  original_price,
  category,
  subcategory,
  material,
  fuel_type,
  dimensions,
  weight,
  features,
  specifications,
  images,
  badge,
  stock_count,
  in_stock,
  featured,
  status
) VALUES

-- Product 1: Replace with actual fireplace details
(
  'Fireplace Name 1',                    -- name (REQUIRED)
  'Short description of fireplace',       -- description (REQUIRED)
  'Long detailed description...',       -- long_description (optional)
  1299.00,                                -- price (REQUIRED)
  1599.00,                                -- original_price (optional - for sale price)
  'limestone',                           -- category (REQUIRED: limestone, marble, granite, etc.)
  'fireplace',                           -- subcategory (optional)
  'limestone',                           -- material (REQUIRED)
  'gas',                                 -- fuel_type (REQUIRED: gas, electric, wood, etc.)
  '1200mm x 600mm x 300mm',              -- dimensions (optional)
  '150kg',                               -- weight (optional)
  ARRAY['Feature 1', 'Feature 2', 'Feature 3'],  -- features (array, optional)
  '{"Heat Output": "5kW", "Efficiency": "85%"}',  -- specifications (JSON, optional)
  ARRAY[]::TEXT[],                       -- images (empty for now, add manually later)
  NULL,                                  -- badge (optional: 'Best Seller', 'New', 'Premium', etc.)
  0,                                     -- stock_count (default 0)
  false,                                 -- in_stock (default false)
  false,                                 -- featured (set true for featured products)
  'active'                               -- status: 'active' or 'inactive'
),

-- Product 2: Replace with actual fireplace details
(
  'Fireplace Name 2',
  'Short description',
  'Long description...',
  899.00,
  1099.00,
  'marble',
  'electric',
  'marble',
  'electric',
  '1000mm x 500mm x 200mm',
  '80kg',
  ARRAY['Remote control', 'LED effects', 'Energy efficient'],
  '{"Power": "2kW", "Remote": "Yes"}',
  ARRAY[]::TEXT[],
  'New',
  0,
  false,
  true,
  'active'
),

-- Product 3: Replace with actual fireplace details
(
  'Fireplace Name 3',
  'Short description',
  'Long description...',
  1899.00,
  NULL,                                  -- No original_price if not on sale
  'granite',
  'stove',
  'granite',
  'wood',
  '800mm x 600mm x 400mm',
  '200kg',
  ARRAY['High heat retention', 'Rustic appearance'],
  '{"Heat Output": "8kW", "Firebox Size": "Large"}',
  ARRAY[]::TEXT[],
  NULL,
  0,
  false,
  false,
  'active'
);

-- Continue adding more products below...
-- Copy the format above and replace with your actual fireplace data

-- COMMON VALUES REFERENCE:
-- categories: 'limestone', 'marble', 'granite', 'travertine', 'cast-iron'
-- fuel_type: 'gas', 'electric', 'wood', 'multi-fuel'
-- badges: 'Best Seller', 'New', 'Premium', 'Sale', or NULL
-- featured: true (show on homepage) or false
-- status: 'active' (visible) or 'inactive' (hidden)

