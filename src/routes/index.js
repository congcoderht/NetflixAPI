const express = require('express');
const router = express.Router();
const userRoutes = require('./userRoutes');
const authRoutes = require('./authRoutes');

// Định tuyến các routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);

// Route mặc định
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to Netflix API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      users: '/api/users',
      swagger: '/api-docs'
    }
  });
});

module.exports = router;

