-- Migration: Generate slugs for existing products
-- This script generates slugs from product names for all products that don't have slugs yet
-- Run this in Supabase SQL Editor after adding the slug column

-- Step 1: Generate slugs for products without slugs
-- This uses a simple slug generation (lowercase, replace spaces with dashes, remove special chars)
UPDATE products
SET slug = LOWER(
  REGEXP_REPLACE(
    REGEXP_REPLACE(
      REGEXP_REPLACE(name, '[^a-zA-Z0-9\s-]', '', 'g'), -- Remove special characters
      '\s+', '-', 'g' -- Replace spaces with dashes
    ),
    '-+', '-', 'g' -- Replace multiple dashes with single dash
  )
)
WHERE slug IS NULL OR slug = '';

-- Step 2: Handle duplicate slugs by appending product ID
-- If multiple products have the same slug, append a unique identifier
UPDATE products p1
SET slug = p1.slug || '-' || SUBSTRING(p1.id::text, 1, 8)
WHERE EXISTS (
  SELECT 1 
  FROM products p2 
  WHERE p2.slug = p1.slug 
  AND p2.id != p1.id
  AND p1.slug IS NOT NULL
);

-- Step 3: Verify - Check for any remaining NULL slugs
-- SELECT id, name, slug FROM products WHERE slug IS NULL OR slug = '';

