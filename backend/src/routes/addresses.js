const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { authMiddleware } = require('../middleware/auth');

// Get my addresses
router.get('/', authMiddleware, async (req, res, next) => {
  try {
    const result = await db.query('SELECT * FROM addresses WHERE user_id = $1 ORDER BY is_default DESC, created_at DESC', [req.user.id]);
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

// Create address
router.post('/', authMiddleware, async (req, res, next) => {
  try {
    const { fullName, phone, addressLine1, addressLine2, city, state, postalCode, country, addressType, isDefault } = req.body;
    
    if (isDefault) {
      await db.query('UPDATE addresses SET is_default = false WHERE user_id = $1', [req.user.id]);
    }

    const result = await db.query(`
      INSERT INTO addresses (user_id, full_name, phone, address_line1, address_line2, city, state, postal_code, country, address_type, is_default)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *
    `, [req.user.id, fullName, phone, addressLine1, addressLine2, city, state, postalCode, country || 'India', addressType || 'HOME', isDefault || false]);

    res.status(201).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
