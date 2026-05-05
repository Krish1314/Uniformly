INSERT INTO users (first_name, last_name, email, phone, password_hash, role)
VALUES (
    'Krish',
    'Patel',
    'abc@gmail.com',
    '+911234567890',
    '{noop}password123',
    'CUSTOMER'
);

INSERT INTO schools (name, city, state) VALUES
('Delhi Public School', 'Delhi', 'Delhi'),
('Bishop Cotton School', 'Bangalore', 'Karnataka'),
('La Martiniere College', 'Chennai', 'Tamil Nadu'),
('Delhi Public School', 'Mumbai', 'Maharashtra'),
('The Doon School', 'Dehradun', 'Uttarakhand');

INSERT INTO categories (name, slug) VALUES
('Shirts', 'shirts'),
('Bottoms', 'bottoms'),
('Outerwear', 'outerwear'),
('Accessories', 'accessories');

INSERT INTO products (
    school_id,
    category_id,
    name,
    description,
    price,
    gst_rate,
    image_url,
    is_featured
) VALUES
(
    1,
    3,
    'DPS Navy V-Neck Sweater',
    'Soft acrylic-wool V-neck sweater in deep navy. Layered easily under a blazer for cooler mornings.',
    1999.00,
    0,
    '/images/sweater.jpg',
    TRUE
),
(
    1,
    3,
    'DPS Maroon Blazer',
    'Formal maroon school blazer for Delhi Public School students.',
    1499.00,
    0,
    '/images/blazer.jpg',
    TRUE
),
(
    1,
    2,
    'DPS Navy Trousers',
    'Durable navy trousers for regular school wear.',
    1499.00,
    0,
    '/images/trousers.jpg',
    TRUE
),
(
    1,
    1,
    'DPS Half-Sleeve Shirt',
    'Comfortable half-sleeve shirt for daily school uniform.',
    999.00,
    0,
    '/images/sweater.jpg',
    TRUE
);

INSERT INTO product_variants (
    product_id,
    size,
    color,
    sku,
    stock_quantity
) VALUES
(1, 'XS', 'Navy', 'DPS-SWEATER-NAVY-XS', 10),
(1, 'S', 'Navy', 'DPS-SWEATER-NAVY-S', 10),
(1, 'M', 'Navy', 'DPS-SWEATER-NAVY-M', 10),
(1, 'L', 'Navy', 'DPS-SWEATER-NAVY-L', 10),
(1, 'XL', 'Navy', 'DPS-SWEATER-NAVY-XL', 10),
(1, 'XXL', 'Navy', 'DPS-SWEATER-NAVY-XXL', 10),
(2, 'M', 'Maroon', 'DPS-BLAZER-MAROON-M', 8),
(2, 'L', 'Maroon', 'DPS-BLAZER-MAROON-L', 8),
(3, 'M', 'Navy', 'DPS-TROUSERS-NAVY-M', 12),
(3, 'L', 'Navy', 'DPS-TROUSERS-NAVY-L', 12),
(4, 'M', 'White', 'DPS-SHIRT-WHITE-M', 15),
(4, 'L', 'White', 'DPS-SHIRT-WHITE-L', 15);

INSERT INTO addresses (
    user_id,
    label,
    full_name,
    phone,
    address_line,
    city,
    state,
    pincode,
    is_default
) VALUES (
    1,
    'Home',
    'Krish Patel',
    '+91 1234567890',
    'House Number, Building, Area',
    'Pune',
    'Maharashtra',
    '123456',
    TRUE
);
