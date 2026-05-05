-- V10: Seed products for Bishop Cotton School, La Martiniere, and The Doon School

-- Bishop Cotton School (id=2) — shirts, bottoms, outerwear
INSERT INTO products (school_id, category_id, name, description, price, gst_rate, image_url, is_featured)
VALUES
(2, 1, 'BCS White Oxford Shirt',
 'Classic white Oxford shirt for Bishop Cotton School students. Full-sleeve with school crest.',
 849.00, 0, '/images/sweater.jpg', TRUE),
(2, 2, 'BCS Grey Flannel Trousers',
 'Premium grey flannel trousers, part of the BCS formal uniform.',
 1299.00, 0, '/images/trousers.jpg', TRUE),
(2, 3, 'BCS Navy Blazer',
 'Formal navy blazer with Bishop Cotton School emblem. Required for assemblies and events.',
 2199.00, 0, '/images/blazer.jpg', TRUE),
(2, 4, 'BCS House Tie',
 'Striped house tie in BCS colours. Available in all four house colours.',
 299.00, 0, '/images/sweater.jpg', FALSE);

-- La Martiniere College (id=3) — shirts, bottoms, outerwear, accessories
INSERT INTO products (school_id, category_id, name, description, price, gst_rate, image_url, is_featured)
VALUES
(3, 1, 'LMC Blue Striped Shirt',
 'Signature blue-striped shirt for La Martiniere College students.',
 799.00, 0, '/images/sweater.jpg', TRUE),
(3, 2, 'LMC Khaki Shorts',
 'Comfortable khaki shorts for junior students at La Martiniere College.',
 699.00, 0, '/images/trousers.jpg', TRUE),
(3, 3, 'LMC Maroon Sweater',
 'Warm maroon V-neck sweater in school colours, for cooler months.',
 1599.00, 0, '/images/sweater.jpg', TRUE),
(3, 4, 'LMC School Belt',
 'Black leather belt with La Martiniere College buckle.',
 249.00, 0, '/images/sweater.jpg', FALSE);

-- The Doon School (id=5) — shirts, bottoms, outerwear
INSERT INTO products (school_id, category_id, name, description, price, gst_rate, image_url, is_featured)
VALUES
(5, 1, 'Doon White Formal Shirt',
 'Classic white formal shirt for The Doon School students. Tailored fit.',
 999.00, 0, '/images/sweater.jpg', TRUE),
(5, 2, 'Doon Grey Trousers',
 'Smart grey trousers — mandatory for all Doon School students.',
 1399.00, 0, '/images/trousers.jpg', TRUE),
(5, 3, 'Doon School Blazer',
 'Iconic Doon School dark-grey blazer with embossed school badge.',
 2499.00, 0, '/images/blazer.jpg', TRUE);

-- Add variants for BCS products
INSERT INTO product_variants (product_id, size, color, sku, stock_quantity)
SELECT p.id, v.size, v.color, CONCAT('BCS-', UPPER(REPLACE(p.name, ' ', '-')), '-', v.size), 15
FROM products p
CROSS JOIN (VALUES
  ('S', 'White'), ('M', 'White'), ('L', 'White'), ('XL', 'White')
) AS v(size, color)
WHERE p.school_id = 2 AND p.category_id = 1;

INSERT INTO product_variants (product_id, size, color, sku, stock_quantity)
SELECT p.id, v.size, v.color, CONCAT('BCS-', UPPER(REPLACE(p.name, ' ', '-')), '-', v.size), 12
FROM products p
CROSS JOIN (VALUES
  ('M', 'Grey'), ('L', 'Grey'), ('XL', 'Grey')
) AS v(size, color)
WHERE p.school_id = 2 AND p.category_id = 2;

INSERT INTO product_variants (product_id, size, color, sku, stock_quantity)
SELECT p.id, v.size, v.color, CONCAT('BCS-', UPPER(REPLACE(p.name, ' ', '-')), '-', v.size), 8
FROM products p
CROSS JOIN (VALUES
  ('M', 'Navy'), ('L', 'Navy'), ('XL', 'Navy')
) AS v(size, color)
WHERE p.school_id = 2 AND p.category_id = 3;

INSERT INTO product_variants (product_id, size, color, sku, stock_quantity)
VALUES
((SELECT id FROM products WHERE name = 'BCS House Tie' LIMIT 1), 'One Size', 'Striped', 'BCS-TIE-OS', 30);

-- Add variants for LMC products
INSERT INTO product_variants (product_id, size, color, sku, stock_quantity)
SELECT p.id, v.size, v.color, CONCAT('LMC-', UPPER(REPLACE(p.name, ' ', '-')), '-', v.size), 15
FROM products p
CROSS JOIN (VALUES
  ('S', 'Blue'), ('M', 'Blue'), ('L', 'Blue'), ('XL', 'Blue')
) AS v(size, color)
WHERE p.school_id = 3 AND p.category_id = 1;

INSERT INTO product_variants (product_id, size, color, sku, stock_quantity)
SELECT p.id, v.size, v.color, CONCAT('LMC-', UPPER(REPLACE(p.name, ' ', '-')), '-', v.size), 10
FROM products p
CROSS JOIN (VALUES
  ('S', 'Khaki'), ('M', 'Khaki'), ('L', 'Khaki')
) AS v(size, color)
WHERE p.school_id = 3 AND p.category_id = 2;

INSERT INTO product_variants (product_id, size, color, sku, stock_quantity)
SELECT p.id, v.size, v.color, CONCAT('LMC-', UPPER(REPLACE(p.name, ' ', '-')), '-', v.size), 10
FROM products p
CROSS JOIN (VALUES
  ('S', 'Maroon'), ('M', 'Maroon'), ('L', 'Maroon'), ('XL', 'Maroon')
) AS v(size, color)
WHERE p.school_id = 3 AND p.category_id = 3;

INSERT INTO product_variants (product_id, size, color, sku, stock_quantity)
VALUES
((SELECT id FROM products WHERE name = 'LMC School Belt' LIMIT 1), 'One Size', 'Black', 'LMC-BELT-OS', 25);

-- Add variants for Doon School products
INSERT INTO product_variants (product_id, size, color, sku, stock_quantity)
SELECT p.id, v.size, v.color, CONCAT('DOON-', UPPER(REPLACE(p.name, ' ', '-')), '-', v.size), 15
FROM products p
CROSS JOIN (VALUES
  ('S', 'White'), ('M', 'White'), ('L', 'White'), ('XL', 'White')
) AS v(size, color)
WHERE p.school_id = 5 AND p.category_id = 1;

INSERT INTO product_variants (product_id, size, color, sku, stock_quantity)
SELECT p.id, v.size, v.color, CONCAT('DOON-', UPPER(REPLACE(p.name, ' ', '-')), '-', v.size), 12
FROM products p
CROSS JOIN (VALUES
  ('M', 'Grey'), ('L', 'Grey'), ('XL', 'Grey')
) AS v(size, color)
WHERE p.school_id = 5 AND p.category_id = 2;

INSERT INTO product_variants (product_id, size, color, sku, stock_quantity)
SELECT p.id, v.size, v.color, CONCAT('DOON-', UPPER(REPLACE(p.name, ' ', '-')), '-', v.size), 8
FROM products p
CROSS JOIN (VALUES
  ('M', 'Dark Grey'), ('L', 'Dark Grey'), ('XL', 'Dark Grey')
) AS v(size, color)
WHERE p.school_id = 5 AND p.category_id = 3;
