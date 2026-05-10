-- Delete existing admin to ensure fresh state
DELETE FROM users WHERE email = 'admin@uniformly.in';

-- Re-insert with verified 'admin123' BCrypt hash
INSERT INTO users (first_name, last_name, email, phone, password_hash, role)
VALUES ('Admin', 'User', 'admin@uniformly.in', '+910000000000', '$2a$10$EblZqNptyYvcLm/VwDCVAuBjzZOAK9S8x6H8T5WPS6kR4VqH6B2C6', 'ADMIN');

-- Also fix the test user
DELETE FROM users WHERE email = 'abc@gmail.com';
INSERT INTO users (first_name, last_name, email, phone, password_hash, role)
VALUES ('Test', 'User', 'abc@gmail.com', '+910000000001', '$2a$10$EblZqNptyYvcLm/VwDCVAuBjzZOAK9S8x6H8T5WPS6kR4VqH6B2C6', 'CUSTOMER');
