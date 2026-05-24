-- Add indexes to optimize product searching and filtering
CREATE INDEX IF NOT EXISTS idx_products_is_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_products_name_lower ON products (lower(name));

-- Add indexes to optimize order and cart lookups
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_user_id ON cart_items(user_id);

-- Composite index for the most common product filter (active + school)
CREATE INDEX IF NOT EXISTS idx_products_active_school ON products(is_active, school_id);
