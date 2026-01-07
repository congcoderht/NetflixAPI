const express = require('express');
const router = express.Router();
const SubController = require('../controllers/subController');
const { authenticate, authorize } = require('../middleware/auth');

// Public: list all subscription plans
router.get('/plans', SubController.getPlans);

// Protected: list subscriptions for current user
router.get('/my', authenticate, SubController.getMySubscriptions);

// Protected: current active subscription for user
router.get('/current', authenticate, SubController.getCurrent);

module.exports = router;
