const express = require('express');
const router = express.Router();
const adminAuthController = require('../../controllers/admin/adminAuthController');
const {authorize} = require('../../middleware/auth');

router.post('/login', authorize("admin"), adminAuthController.login);

module.exports = router;