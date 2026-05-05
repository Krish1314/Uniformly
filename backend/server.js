require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({ origin: '*' }));
app.use(express.json());
app.use(morgan('dev'));

// Routes
const authRoutes = require('./src/routes/auth');
const userRoutes = require('./src/routes/users');
const productRoutes = require('./src/routes/products');
const schoolRoutes = require('./src/routes/schools');
const cartRoutes = require('./src/routes/cart');
const orderRoutes = require('./src/routes/orders');
const addressRoutes = require('./src/routes/addresses');
const adminRoutes = require('./src/routes/admin');

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/products', productRoutes);
app.use('/api/v1/schools', schoolRoutes);
app.use('/api/v1/cart', cartRoutes);
app.use('/api/v1/orders', orderRoutes);
app.use('/api/v1/addresses', addressRoutes);
app.use('/api/v1/admin', adminRoutes);

// Health Route
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date(), environment: process.env.NODE_ENV });
});

// Base Route
app.get('/', (req, res) => {
  res.send('Uniformly API is running...');
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  const status = err.status || 500;
  res.status(status).json({
    message: err.message || 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app;
