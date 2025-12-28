const express = require('express');
const router = express.Router();
const { authenticate,authorize } = require('../middleware/auth');
const OrderController = require('../controllers/orderController');

router.use(authenticate);

// lấy tất cả đơn hàng theo người dùng
router.get('/my', OrderController.getOrderHistory);

// lấy tất cả đơn hàng
router.get('/all', authorize("admin"), OrderController.getAll);

// cập nhật trạng thái đơn hàng
router.put('/:id/status', authorize("admin"), OrderController.updateStatus);

module.exports = router;