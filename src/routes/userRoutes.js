const express = require('express');
const router = express.Router();
const UserController = require('../controllers/userController');
const { authenticate } = require('../middleware/auth');
const verifyAdmin = require('../middleware/admin/verifyAdmin');

router.use(authenticate); // Tất cả routes trong file này yêu cầu JWT

router.get('/', verifyAdmin, UserController.getAllUsers);
router.get('/:id', verifyAdmin, UserController.getDetailedUserById);
// router.post('/', UserController.createUser);
router.put('/profile', UserController.updateProfile);
// router.put('/:id', UserController.updateUser);
// router.delete('/:id', UserController.deleteUser);

router.put('/:id/status', verifyAdmin, UserController.updateStatus);

module.exports = router;

