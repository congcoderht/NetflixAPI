const express = require('express');
const router = express.Router();
const MovieController = require('../controllers/movieController');

const { authenticate,authorize } = require('../middleware/auth');


router.use(authenticate); // Tất cả routes trong file này yêu cầu JWT


// Xem danh sach phim (Phan trang)

router.get('/',authorize("user","admin"), MovieController.getMovies);




module.exports = router;

