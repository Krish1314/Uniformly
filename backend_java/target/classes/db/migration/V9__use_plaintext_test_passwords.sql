UPDATE users
SET password_hash = 'password123',
    updated_at = CURRENT_TIMESTAMP
WHERE email = 'abc@gmail.com';

UPDATE users
SET password_hash = 'admin123',
    role = 'ADMIN',
    updated_at = CURRENT_TIMESTAMP
WHERE email = 'admin@uniformly.in';
