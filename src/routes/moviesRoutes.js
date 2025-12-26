const express = require('express');
const router = express.Router();
const MovieController = require('../controllers/movieController');

const { authenticate,authorize } = require('../middleware/auth');


router.use(authenticate); // Tất cả routes trong file này yêu cầu JWT


// Xem danh sach phim (Phan trang)
router.get('/',authorize("user","admin"), MovieController.getMovies);

// Lấy tất cả thể loại phim
router.get('/genres', authorize("user","admin"), MovieController.getGenres);

// Xem chi tiết phim theo ID
router.get('/:id', authorize("user","admin"), MovieController.getMovieDetail);

// Đánh giá phim (tạo hoặc cập nhật đánh giá của user hiện tại)
router.put('/:id/rating', authorize("user"), MovieController.rateMovie);



// Thêm phim mới (chỉ admin)

module.exports = router;

