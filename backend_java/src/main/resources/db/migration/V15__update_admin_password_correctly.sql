-- Update admin password to 'admin123' using a verified hash
UPDATE users 
SET password_hash = '$2a$10$EblZqNptyYvcLm/VwDCVAuBjzZOAK9S8x6H8T5WPS6kR4VqH6B2C6',
    updated_at = CURRENT_TIMESTAMP
WHERE email = 'admin@uniformly.in';

-- Update test user password
UPDATE users 
SET password_hash = '$2a$10$EblZqNptyYvcLm/VwDCVAuBjzZOAK9S8x6H8T5WPS6kR4VqH6B2C6',
    updated_at = CURRENT_TIMESTAMP
WHERE email = 'abc@gmail.com';
