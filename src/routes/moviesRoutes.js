const express = require('express');
const router = express.Router();
const MovieController = require('../controllers/movieController');
const { authenticate, authorize } = require('../middleware/auth');


router.use(authenticate); // all routes require JWT


// Xem danh sach phim (Phan trang)
router.get('/', authorize("user","admin"), MovieController.getMovies);

// Lấy tất cả thể loại phim
router.get('/genres', authorize("user","admin"), MovieController.getGenres);

// Tạo genre mới (chỉ admin)
router.post('/genres', authorize("admin"), MovieController.createGenre);

// Lấy tất cả cast members
router.get('/members', authorize("user", "admin"), MovieController.getAllCastMembers);

// Tạo cast member mới (chỉ admin)
router.post('/members', authorize("admin"), MovieController.createCastMember);

// Đánh giá phim (tạo hoặc cập nhật đánh giá của user hiện tại)
router.put('/:id/rating', authorize("user"), MovieController.rateMovie);


// Xem chi tiết phim theo ID
router.get('/:id', authorize("user","admin"), MovieController.getMovieDetail);


// Tạo phim mới (chỉ admin) - genres và members phải được tạo trước
router.post('/', authorize("admin"), MovieController.createMovie);



// Cập nhật phim (chỉ admin)
router.put('/:id', authorize("admin"), MovieController.updateMovie);

// Xóa hoặc khôi phục phim (chỉ admin)
router.patch('/:id/toggle-delete', authorize("admin"), MovieController.toggleDeleteMovie);
module.exports = router;

