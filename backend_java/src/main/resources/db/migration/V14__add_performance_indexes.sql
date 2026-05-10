-- Add indexes to optimize product searching and filtering
CREATE INDEX idx_products_school_id ON products(school_id);
CREATE INDEX idx_products_category_id ON products(category_id);
CREATE INDEX idx_products_active ON products(active);
CREATE INDEX idx_products_name_lower ON products (lower(name));

-- Add indexes to optimize order and cart lookups
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_cart_items_user_id ON cart_items(user_id);

-- Composite index for the most common product filter (active + school)
CREATE INDEX idx_products_active_school ON products(active, school_id);
