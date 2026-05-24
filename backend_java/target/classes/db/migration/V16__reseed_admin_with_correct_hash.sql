-- Update admin user with verified hash (avoid DELETE to prevent FK violations)
UPDATE users 
SET password_hash = '$2a$10$EblZqNptyYvcLm/VwDCVAuBjzZOAK9S8x6H8T5WPS6kR4VqH6B2C6',
    role = 'ADMIN',
    updated_at = CURRENT_TIMESTAMP
WHERE email = 'admin@uniformly.in';

-- Update test user
UPDATE users 
SET password_hash = '$2a$10$EblZqNptyYvcLm/VwDCVAuBjzZOAK9S8x6H8T5WPS6kR4VqH6B2C6',
    updated_at = CURRENT_TIMESTAMP
WHERE email = 'abc@gmail.com';

