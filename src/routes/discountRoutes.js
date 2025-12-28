const express = require('express');
const router = express.Router();
const { authenticate,authorize } = require('../middleware/auth');
const DiscountController = require('../controllers/discountController');

router.use(authenticate);

// lấy danh sách mã giảm giá
router.get('/', authorize("admin"), DiscountController.getAll);

// tạo mã giảm giá
router.post('/', authorize("admin"), DiscountController.create);

// chỉnh sửa mã giảm giá
router.put('/:id', authorize("admin"), DiscountController.update);


module.exports = router;