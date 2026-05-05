const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { authMiddleware } = require('../middleware/auth');

// Checkout (Create Order)
router.post('/checkout', authMiddleware, async (req, res, next) => {
  const client = await db.pool.connect();
  try {
    await client.query('BEGIN');
    
    const { shippingAddressId, billingAddressId, paymentMethod } = req.body;

    // 1. Get cart items
    const cartRes = await client.query(`
      SELECT ci.*, p.price 
      FROM cart_items ci 
      JOIN products p ON ci.product_id = p.id 
      WHERE ci.user_id = $1
    `, [req.user.id]);

    if (cartRes.rows.length === 0) {
      throw new Error('Cart is empty');
    }

    const totalAmount = cartRes.rows.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    // 2. Create Order
    const orderRes = await client.query(`
      INSERT INTO orders (user_id, total_amount, status, shipping_address_id, billing_address_id, payment_method, payment_status)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `, [req.user.id, totalAmount, 'PENDING', shippingAddressId, billingAddressId || shippingAddressId, paymentMethod, 'PENDING']);

    const orderId = orderRes.rows[0].id;

    // 3. Create Order Items
    for (const item of cartRes.rows) {
      await client.query(`
        INSERT INTO order_items (order_id, product_id, variant_id, quantity, price)
        VALUES ($1, $2, $3, $4, $5)
      `, [orderId, item.product_id, item.variant_id, item.quantity, item.price]);
    }

    // 4. Clear Cart
    await client.query('DELETE FROM cart_items WHERE user_id = $1', [req.user.id]);

    await client.query('COMMIT');
    res.status(201).json(orderRes.rows[0]);
  } catch (err) {
    await client.query('ROLLBACK');
    next(err);
  } finally {
    client.release();
  }
});

// Get my orders
router.get('/my-orders', authMiddleware, async (req, res, next) => {
  try {
    const result = await db.query(`
      SELECT o.*, 
        (SELECT COUNT(*) FROM order_items WHERE order_id = o.id) as "itemCount"
      FROM orders o 
      WHERE o.user_id = $1 
      ORDER BY o.created_at DESC
    `, [req.user.id]);
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

// Get order details
router.get('/:id', authMiddleware, async (req, res, next) => {
  try {
    const orderRes = await db.query('SELECT * FROM orders WHERE id = $1 AND user_id = $2', [req.params.id, req.user.id]);
    
    if (orderRes.rows.length === 0) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const itemsRes = await db.query(`
      SELECT oi.*, p.name, p.image_url as "imageUrl", pv.size, pv.color
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      JOIN product_variants pv ON oi.variant_id = pv.id
      WHERE oi.order_id = $1
    `, [req.params.id]);

    const order = orderRes.rows[0];
    order.items = itemsRes.rows;

    res.json(order);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
