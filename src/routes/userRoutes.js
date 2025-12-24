const express = require('express');
const router = express.Router();
const UserController = require('../controllers/userController');
const { authenticate,authorize } = require('../middleware/auth');
const { route } = require('./userRoutes');

router.use(authenticate); // Tất cả routes trong file này yêu cầu JWT

// Admin routes
router.get('/', authorize("admin"), UserController.getAllUsers);
router.get('/:id', authorize("admin"), UserController.getDetailedUserById);
router.put('/:id/status', authorize("admin"), UserController.updateStatus);


// User routes
router.put('/profile', authorize("customer"), UserController.updateProfile);



module.exports = router;

