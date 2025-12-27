const express = require('express');
const router = express.Router();
const WatchListController = require('../controllers/watchlistController');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

router.get('/', WatchListController.getByUserId);
// Router.delete('/:id', WatchListController.deleteMovie);
// Router.post('/:id', WatchListController.addMovie);

module.exports = router;