-- Update seeded users to use BCrypt hashes instead of plaintext
-- Password is 'admin123'
UPDATE users 
SET password_hash = '$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07xd00DMxs.TVuHOn2',
    updated_at = CURRENT_TIMESTAMP
WHERE email = 'admin@uniformly.in';

-- Password is 'password123'
UPDATE users 
SET password_hash = '$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07xd00DMxs.TVuHOn2',
    updated_at = CURRENT_TIMESTAMP
WHERE email = 'abc@gmail.com';
