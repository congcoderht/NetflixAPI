const express = require('express');
const router = express.Router();
const WatchListController = require('../controllers/watchlistController');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

// lấy danh sách yêu thích
router.get('/', WatchListController.getByUserId);

// xóa phim khỏi danh sách yêu thích
router.delete('/:id', WatchListController.deleteMovie);

// thêm phim vào danh sách yêu thích
router.post('/:id', WatchListController.addMovie);

module.exports = router;