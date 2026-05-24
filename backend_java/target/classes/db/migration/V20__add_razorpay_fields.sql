-- V20: Add Razorpay payment fields to orders table
-- razorpay_order_id  : The Razorpay order ID (order_xxx) returned when a payment session is created
-- razorpay_payment_id: The Razorpay payment ID (pay_xxx) received after successful payment

ALTER TABLE orders
    ADD COLUMN IF NOT EXISTS razorpay_order_id   VARCHAR(255),
    ADD COLUMN IF NOT EXISTS razorpay_payment_id  VARCHAR(255);

-- Index for fast lookup during webhook / verify callback
CREATE INDEX IF NOT EXISTS idx_orders_razorpay_order_id ON orders(razorpay_order_id);
