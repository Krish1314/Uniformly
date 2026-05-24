-- Add a secondary admin user for guaranteed access
INSERT INTO users (first_name, last_name, email, phone, password_hash, role)
VALUES ('Krish', 'Admin', 'krishadmin@uniformly.in', '+911234567890', '$2a$10$EblZqNptyYvcLm/VwDCVAuBjzZOAK9S8x6H8T5WPS6kR4VqH6B2C6', 'ADMIN')
ON CONFLICT (email) DO UPDATE SET
    password_hash = EXCLUDED.password_hash,
    role = 'ADMIN',
    updated_at = CURRENT_TIMESTAMP;
