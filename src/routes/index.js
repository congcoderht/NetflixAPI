const express = require('express');
const router = express.Router();
const userRoutes = require('./userRoutes');
const authRoutes = require('./authRoutes');

const adminAuthRoutes = require('./admin/adminAuthRoutes');

// Định tuyến các routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);


// Định tuyến routes admin
router.use('/admin/auth', adminAuthRoutes)

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

