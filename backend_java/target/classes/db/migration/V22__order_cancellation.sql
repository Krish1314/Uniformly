-- Order cancellation audit + quick lookup on orders
ALTER TABLE orders
    ADD COLUMN IF NOT EXISTS cancellation_reason VARCHAR(255),
    ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMP,
    ADD COLUMN IF NOT EXISTS cancelled_by VARCHAR(30);

CREATE TABLE IF NOT EXISTS order_cancellations (
    id BIGSERIAL PRIMARY KEY,
    order_id BIGINT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    user_id BIGINT NOT NULL REFERENCES users(id),
    reason VARCHAR(255) NOT NULL,
    cancelled_by VARCHAR(30) NOT NULL DEFAULT 'CUSTOMER',
    refund_status VARCHAR(50),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_order_cancellations_order_id ON order_cancellations(order_id);
