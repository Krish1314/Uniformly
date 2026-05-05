const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

router.use(authMiddleware, adminMiddleware);

// Admin Dashboard Stats
router.get('/dashboard/stats', async (req, res, next) => {
  try {
    const totalSales = await db.query('SELECT SUM(total_amount) as total FROM orders WHERE status != $1', ['CANCELLED']);
    const totalOrders = await db.query('SELECT COUNT(*) as count FROM orders');
    const totalProducts = await db.query('SELECT COUNT(*) as count FROM products');
    const totalUsers = await db.query('SELECT COUNT(*) as count FROM users');

    res.json({
      totalSales: parseFloat(totalSales.rows[0].total || 0),
      totalOrders: parseInt(totalOrders.rows[0].count),
      totalProducts: parseInt(totalProducts.rows[0].count),
      totalUsers: parseInt(totalUsers.rows[0].count)
    });
  } catch (err) {
    next(err);
  }
});

// Admin Orders
router.get('/orders', async (req, res, next) => {
  try {
    const result = await db.query(`
      SELECT o.*, u.first_name, u.last_name, u.email 
      FROM orders o 
      JOIN users u ON o.user_id = u.id 
      ORDER BY o.created_at DESC
    `);
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

// Admin Products
router.get('/products', async (req, res, next) => {
  try {
    const result = await db.query(`
      SELECT p.*, s.name as "schoolName", c.name as "categoryName" 
      FROM products p 
      LEFT JOIN schools s ON p.school_id = s.id 
      LEFT JOIN categories c ON p.category_id = c.id 
      ORDER BY p.created_at DESC
    `);
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
