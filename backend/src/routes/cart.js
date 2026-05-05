const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { authMiddleware } = require('../middleware/auth');

// Get cart items
router.get('/', authMiddleware, async (req, res, next) => {
  try {
    const result = await db.query(`
      SELECT ci.*, p.name, p.price, p.image_url as "imageUrl", pv.size, pv.color 
      FROM cart_items ci
      JOIN products p ON ci.product_id = p.id
      JOIN product_variants pv ON ci.variant_id = pv.id
      WHERE ci.user_id = $1
      ORDER BY ci.created_at DESC
    `, [req.user.id]);
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

// Add to cart
router.post('/', authMiddleware, async (req, res, next) => {
  try {
    const { productId, variantId, quantity } = req.body;

    // Check if already in cart
    const existing = await db.query('SELECT * FROM cart_items WHERE user_id = $1 AND variant_id = $2', [req.user.id, variantId]);
    
    if (existing.rows.length > 0) {
      const newQuantity = existing.rows[0].quantity + quantity;
      const result = await db.query(
        'UPDATE cart_items SET quantity = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
        [newQuantity, existing.rows[0].id]
      );
      return res.json(result.rows[0]);
    }

    const result = await db.query(
      'INSERT INTO cart_items (user_id, product_id, variant_id, quantity) VALUES ($1, $2, $3, $4) RETURNING *',
      [req.user.id, productId, variantId, quantity]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

// Update cart quantity
router.patch('/:id', authMiddleware, async (req, res, next) => {
  try {
    const { quantity } = req.body;
    const result = await db.query(
      'UPDATE cart_items SET quantity = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 AND user_id = $3 RETURNING *',
      [quantity, req.params.id, req.user.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

// Remove from cart
router.delete('/:id', authMiddleware, async (req, res, next) => {
  try {
    await db.query('DELETE FROM cart_items WHERE id = $1 AND user_id = $2', [req.params.id, req.user.id]);
    res.json({ message: 'Item removed from cart' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
