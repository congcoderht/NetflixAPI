const express = require('express');
const router = express.Router();
const userRoutes = require('./userRoutes');
const authRoutes = require('./authRoutes');
const moviesRoutes = require('./moviesRoutes');

const adminAuthRoutes = require('./admin/adminAuthRoutes');
const adminStatsRoutes = require('./admin/adminStatsRoutes');

// Định tuyến các routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/stats', adminStatsRoutes);
router.use('/movies', moviesRoutes);


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

