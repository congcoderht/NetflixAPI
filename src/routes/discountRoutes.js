const express = require('express');
const router = express.Router();
const { authenticate,authorize } = require('../middleware/auth');
const DiscountController = require('../controllers/discountController');

router.use(authenticate);

// tạo mã giảm giá
router.post('/', DiscountController.create);

// chỉnh sửa mã giảm giá
router.put('/:id', DiscountController.update);

module.exports = router;