# Product Slug Migration

This migration generates URL-friendly slugs for all existing products.

## Option 1: SQL Migration (Recommended - Fastest)

1. Go to Supabase Dashboard → SQL Editor
2. Run the SQL script: `generate-product-slugs.sql`
3. Done! All products will have slugs generated from their names

**Pros:**
- Fast (runs directly in database)
- No API calls needed
- Handles duplicates automatically

## Option 2: API Migration (More Control)

1. Make sure you're logged in as admin
2. Make a POST request to `/api/admin/generate-slugs`
3. Or create the API route file and call it

**Pros:**
- Uses the same slug generation logic as the app
- Better error handling
- Can see progress

## Safety Features

✅ **Backward Compatible**: Old UUID URLs will still work
✅ **No Breaking Changes**: Existing links continue to function
✅ **Duplicate Handling**: If two products have the same name, slugs are made unique
✅ **Idempotent**: Can be run multiple times safely (only updates products without slugs)

## After Migration

- Old URLs like `/products/uuid-123` will still work
- New URLs like `/products/product-name` will work
- All new products automatically get slugs
- When you update a product name, the slug updates automatically

## Verify Migration

Check in Supabase:
```sql
SELECT id, name, slug FROM products WHERE slug IS NULL;
```

Should return 0 rows if migration was successful.

