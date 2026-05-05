const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Get all products (with filters)
router.get('/', async (req, res, next) => {
  try {
    const { schoolId, categoryId, featured, search } = req.query;
    let query = `
      SELECT p.*, s.name as "schoolName", c.name as "categoryName" 
      FROM products p 
      LEFT JOIN schools s ON p.school_id = s.id 
      LEFT JOIN categories c ON p.category_id = c.id 
      WHERE p.is_active = true
    `;
    const params = [];

    if (schoolId) {
      params.push(schoolId);
      query += ` AND p.school_id = $${params.length}`;
    }
    if (categoryId) {
      params.push(categoryId);
      query += ` AND p.category_id = $${params.length}`;
    }
    if (featured === 'true') {
      query += ` AND p.is_featured = true`;
    }
    if (search) {
      params.push(`%${search}%`);
      query += ` AND (p.name ILIKE $${params.length} OR p.description ILIKE $${params.length})`;
    }

    query += ' ORDER BY p.created_at DESC';

    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

// Get featured products
router.get('/featured', async (req, res, next) => {
  try {
    const result = await db.query('SELECT * FROM products WHERE is_featured = true AND is_active = true LIMIT 8');
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

// Get product details
router.get('/:id', async (req, res, next) => {
  try {
    const productRes = await db.query(`
      SELECT p.*, s.name as "schoolName", c.name as "categoryName", c.size_chart_data as "sizeChartData", c.size_guide_image_url as "sizeGuideImageUrl", c.size_guide_notes as "sizeGuideNotes"
      FROM products p 
      LEFT JOIN schools s ON p.school_id = s.id 
      LEFT JOIN categories c ON p.category_id = c.id 
      WHERE p.id = $1
    `, [req.params.id]);

    if (productRes.rows.length === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const variantsRes = await db.query('SELECT * FROM product_variants WHERE product_id = $1', [req.params.id]);
    
    const product = productRes.rows[0];
    product.variants = variantsRes.rows;
    
    res.json(product);
  } catch (err) {
    next(err);
  }
});

// Get all categories
router.get('/categories/all', async (req, res, next) => {
  try {
    const result = await db.query('SELECT * FROM categories ORDER BY name');
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
