-- Clean up product image paths by removing prefixes if they exist
UPDATE products
SET image = replace(image, 'images/products/', '')
WHERE image LIKE 'images/products/%';

UPDATE products
SET image = replace(image, '/images/products/', '')
WHERE image LIKE '/images/products/%';

-- Verification
SELECT id, name, image FROM products LIMIT 12;
