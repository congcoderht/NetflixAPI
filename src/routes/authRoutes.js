const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/authController');
const { authenticate,authorize } = require('../middleware/auth');

// Public routes
router.post('/register', AuthController.register);
router.post('/login', AuthController.login);

// Protected routes (cần authentication)
router.use(authenticate);

router.get('/me', authorize("user", "admin"), AuthController.getMe);
router.put('/change-pass', authorize("user", "admin"), AuthController.changePassword);


module.exports = router;

