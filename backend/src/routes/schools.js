const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Get all active schools
router.get('/', async (req, res, next) => {
  try {
    const result = await db.query('SELECT * FROM schools WHERE is_active = true ORDER BY name');
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

// Get school details
router.get('/:id', async (req, res, next) => {
  try {
    const result = await db.query('SELECT * FROM schools WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'School not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
