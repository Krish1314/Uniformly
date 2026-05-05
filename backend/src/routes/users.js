const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { authMiddleware } = require('../middleware/auth');

// Get profile
router.get('/me', authMiddleware, async (req, res, next) => {
  try {
    const result = await db.query('SELECT id, first_name as "firstName", last_name as "lastName", email, phone, role, created_at as "createdAt" FROM users WHERE id = $1', [req.user.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

// Update profile
router.patch('/me', authMiddleware, async (req, res, next) => {
  try {
    const { firstName, lastName, email, phone } = req.body;
    
    // Check email uniqueness if changed
    if (email) {
      const emailCheck = await db.query('SELECT id FROM users WHERE email = $1 AND id != $2', [email.toLowerCase(), req.user.id]);
      if (emailCheck.rows.length > 0) {
        return res.status(400).json({ message: 'Email already taken' });
      }
    }

    const result = await db.query(
      'UPDATE users SET first_name = $1, last_name = $2, email = $3, phone = $4, updated_at = CURRENT_TIMESTAMP WHERE id = $5 RETURNING id, first_name as "firstName", last_name as "lastName", email, phone, role',
      [firstName, lastName, email.toLowerCase(), phone, req.user.id]
    );

    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

// Get user stats
router.get('/me/stats', authMiddleware, async (req, res, next) => {
  try {
    const ordersRes = await db.query('SELECT COUNT(*) as "totalOrders", COALESCE(SUM(total_amount), 0) as "totalSpend" FROM orders WHERE user_id = $1', [req.user.id]);
    res.json({
      totalOrders: parseInt(ordersRes.rows[0].totalOrders),
      totalSpend: parseFloat(ordersRes.rows[0].totalSpend)
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
