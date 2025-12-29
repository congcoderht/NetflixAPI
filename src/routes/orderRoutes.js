const express = require('express');
const router = express.Router();
const { authenticate,authorize } = require('../middleware/auth');
const OrderController = require('../controllers/orderController');

router.use(authenticate);

// lấy tất cả đơn hàng theo người dùng
router.get('/my', OrderController.getOrderHistory);

// lấy tất cả đơn hàng
router.get('/all', authorize("admin"), OrderController.getAll);

// tạo đơn hàng đăng ký / gia hạn gói (user)
router.post('/', authorize("user"), OrderController.createSubscriptionOrder);

// áp dụng mã giảm giá cho đơn hàng (user)
router.put('/apply-discount', authorize("user"), OrderController.applyDiscountToOrder);

// cập nhật trạng thái đơn hàng
router.put('/:id/status', authorize("user"), OrderController.updateStatus);

module.exports = router;