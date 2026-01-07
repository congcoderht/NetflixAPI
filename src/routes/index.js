const express = require('express');
const router = express.Router();
const userRoutes = require('./userRoutes');
const authRoutes = require('./authRoutes');
const moviesRoutes = require('./moviesRoutes');
const watchlistRoutes = require('./watchlistRoutes');
const orderRoutes = require('./orderRoutes');
const promosRoutes = require('./discountRoutes');
const subRoutes = require('./subRoutes');

const adminStatsRoutes = require('./admin/adminStatsRoutes');

// Định tuyến các routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/stats', adminStatsRoutes);
router.use('/movies', moviesRoutes);
router.use('/watchlist', watchlistRoutes);
router.use('/orders', orderRoutes);
router.use('/promos', promosRoutes);
router.use('/subscriptions', subRoutes);



// Route mặc định
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to Netflix API',
    version: '1.0.0'
  });
});

module.exports = router;

