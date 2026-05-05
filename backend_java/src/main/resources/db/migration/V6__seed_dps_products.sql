-- Make sure school exists
INSERT INTO schools (name, city, state)
SELECT 'Delhi Public School', 'Delhi', 'Delhi'
WHERE NOT EXISTS (
    SELECT 1 FROM schools
    WHERE name = 'Delhi Public School'
    AND city = 'Delhi'
);

-- Make sure categories exist
INSERT INTO categories (name, slug)
SELECT 'Outerwear', 'outerwear'
WHERE NOT EXISTS (
    SELECT 1 FROM categories WHERE slug = 'outerwear'
);

INSERT INTO categories (name, slug)
SELECT 'Bottoms', 'bottoms'
WHERE NOT EXISTS (
    SELECT 1 FROM categories WHERE slug = 'bottoms'
);

-- Insert products
INSERT INTO products (
    school_id,
    category_id,
    name,
    description,
    price,
    gst_rate,
    image_url,
    is_featured,
    is_active
)
VALUES
(
    (SELECT id FROM schools WHERE name = 'Delhi Public School' AND city = 'Delhi' LIMIT 1),
    (SELECT id FROM categories WHERE slug = 'outerwear' LIMIT 1),
    'DPS Navy V-Neck Sweater',
    'Soft acrylic-wool V-neck sweater in deep navy. Layered easily under a blazer for cooler mornings.',
    1999.00,
    0,
    '/images/sweater.jpg',
    TRUE,
    TRUE
),
(
    (SELECT id FROM schools WHERE name = 'Delhi Public School' AND city = 'Delhi' LIMIT 1),
    (SELECT id FROM categories WHERE slug = 'bottoms' LIMIT 1),
    'DPS Navy Trousers',
    'Navy school trousers for Delhi Public School students.',
    1499.00,
    0,
    '/images/trousers.jpg',
    TRUE,
    TRUE
),
(
    (SELECT id FROM schools WHERE name = 'Delhi Public School' AND city = 'Delhi' LIMIT 1),
    (SELECT id FROM categories WHERE slug = 'outerwear' LIMIT 1),
    'DPS Maroon Blazer',
    'Formal maroon school blazer for Delhi Public School students.',
    1499.00,
    0,
    '/images/blazer.jpg',
    TRUE,
    TRUE
);

-- Insert variants
INSERT INTO product_variants (product_id, size, color, sku, stock_quantity)
VALUES
((SELECT id FROM products WHERE name = 'DPS Navy V-Neck Sweater' LIMIT 1), 'XS', 'Navy', 'DPS-SWEATER-NAVY-XS', 10),
((SELECT id FROM products WHERE name = 'DPS Navy V-Neck Sweater' LIMIT 1), 'S', 'Navy', 'DPS-SWEATER-NAVY-S', 10),
((SELECT id FROM products WHERE name = 'DPS Navy V-Neck Sweater' LIMIT 1), 'M', 'Navy', 'DPS-SWEATER-NAVY-M', 10),
((SELECT id FROM products WHERE name = 'DPS Navy V-Neck Sweater' LIMIT 1), 'L', 'Navy', 'DPS-SWEATER-NAVY-L', 10),
((SELECT id FROM products WHERE name = 'DPS Navy V-Neck Sweater' LIMIT 1), 'XL', 'Navy', 'DPS-SWEATER-NAVY-XL', 10),
((SELECT id FROM products WHERE name = 'DPS Navy V-Neck Sweater' LIMIT 1), 'XXL', 'Navy', 'DPS-SWEATER-NAVY-XXL', 10),

((SELECT id FROM products WHERE name = 'DPS Navy Trousers' LIMIT 1), 'S', 'Navy', 'DPS-TROUSERS-NAVY-S', 10),
((SELECT id FROM products WHERE name = 'DPS Navy Trousers' LIMIT 1), 'M', 'Navy', 'DPS-TROUSERS-NAVY-M', 10),
((SELECT id FROM products WHERE name = 'DPS Navy Trousers' LIMIT 1), 'L', 'Navy', 'DPS-TROUSERS-NAVY-L', 10),
((SELECT id FROM products WHERE name = 'DPS Navy Trousers' LIMIT 1), 'XL', 'Navy', 'DPS-TROUSERS-NAVY-XL', 10),

((SELECT id FROM products WHERE name = 'DPS Maroon Blazer' LIMIT 1), 'S', 'Maroon', 'DPS-BLAZER-MAROON-S', 8),
((SELECT id FROM products WHERE name = 'DPS Maroon Blazer' LIMIT 1), 'M', 'Maroon', 'DPS-BLAZER-MAROON-M', 8),
((SELECT id FROM products WHERE name = 'DPS Maroon Blazer' LIMIT 1), 'L', 'Maroon', 'DPS-BLAZER-MAROON-L', 8),
((SELECT id FROM products WHERE name = 'DPS Maroon Blazer' LIMIT 1), 'XL', 'Maroon', 'DPS-BLAZER-MAROON-XL', 8)
ON CONFLICT (sku)
DO UPDATE SET
    stock_quantity = EXCLUDED.stock_quantity,
    updated_at = CURRENT_TIMESTAMP;
