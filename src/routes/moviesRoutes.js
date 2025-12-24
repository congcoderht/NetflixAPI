const express = require('express');
const router = express.Router();
const MovieController = require('../controllers/movieController');

const { authenticate,authorize } = require('../middleware/auth');


router.use(authenticate); // Tất cả routes trong file này yêu cầu JWT


// Xem danh sach phim (Phan trang)
router.get('/',authorize("user","admin"), MovieController.getMovies);

// Xem chi tiết phim theo ID
router.get('/:id', authorize("user","admin"), MovieController.getMovieDetail);

// Đánh giá phim (tạo hoặc cập nhật đánh giá của user hiện tại)
router.put('/:id/rating', authorize("user"), MovieController.rateMovie);


module.exports = router;

