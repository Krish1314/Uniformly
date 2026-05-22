-- V19: Enforce single admin — demote all existing admins, upsert sole admin
-- Step 1: Demote ALL existing admin accounts to CUSTOMER
UPDATE users SET role = 'CUSTOMER', updated_at = CURRENT_TIMESTAMP WHERE role = 'ADMIN';

-- Step 2: Upsert the one and only admin: krish09755650065@gmail.com
-- Password: Uniformly@1314 (BCrypt, cost=10)
INSERT INTO users (first_name, last_name, email, phone, password_hash, role)
VALUES (
    'Krish',
    'Patel',
    'krish09755650065@gmail.com',
    '+919755650065',
    '$2a$10$2e4aXgXnkDf/3PeOJBdDF.GSjUkaWcT30A6wiGsmxSFXMgZYYKpkO',
    'ADMIN'
)
ON CONFLICT (email) DO UPDATE SET
    first_name    = EXCLUDED.first_name,
    last_name     = EXCLUDED.last_name,
    password_hash = EXCLUDED.password_hash,
    role          = 'ADMIN',
    updated_at    = CURRENT_TIMESTAMP;
