const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');

// Public routes
router.post('/register', AuthController.register);
router.post('/login', AuthController.login);
router.put('/change-pass', authenticate, AuthController.changePassword);

// Protected routes (cần authentication)
router.get('/me', authenticate, AuthController.getMe);

module.exports = router;

