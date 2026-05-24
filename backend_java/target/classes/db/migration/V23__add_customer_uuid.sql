-- Enable the pgcrypto extension to generate UUIDs
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Add the customer_id column as a UUID
ALTER TABLE users ADD COLUMN customer_id UUID DEFAULT gen_random_uuid() NOT NULL;

-- Ensure it is strictly unique
ALTER TABLE users ADD CONSTRAINT uk_users_customer_id UNIQUE (customer_id);
