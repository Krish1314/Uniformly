INSERT INTO users (
    first_name,
    last_name,
    email,
    phone,
    password_hash,
    role
)
VALUES (
    'Admin',
    'User',
    'admin@uniformly.in',
    '+910000000000',
    'admin123',
    'ADMIN'
)
ON CONFLICT (email)
DO UPDATE SET
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    phone = EXCLUDED.phone,
    password_hash = EXCLUDED.password_hash,
    role = EXCLUDED.role,
    updated_at = CURRENT_TIMESTAMP;
